import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  ReactNode,
} from 'react';
import { ArberInstance, BookieInfo, Statistics, ArbGroup } from '../types';
import { wsService } from '../services/websocket';
import { apiService } from '../services/api';

interface SurebetState {
  arbers: ArberInstance[];
  bookies: BookieInfo[];
  statistics: Statistics;
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}

type SurebetAction =
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'SET_ARBERS'; payload: ArberInstance[] }
  | { type: 'ADD_ARBER'; payload: ArberInstance }
  | {
      type: 'UPDATE_ARBER';
      payload: { id: string; updates: Partial<ArberInstance> };
    }
  | { type: 'REMOVE_ARBER'; payload: string }
  | { type: 'SET_BOOKIES'; payload: BookieInfo[] }
  | {
      type: 'UPDATE_BOOKIE';
      payload: { id: string; updates: Partial<BookieInfo> };
    }
  | { type: 'SET_STATISTICS'; payload: Statistics }
  | {
      type: 'ADD_OPPORTUNITIES';
      payload: { arberId: string; opportunities: ArbGroup };
    };

const initialState: SurebetState = {
  arbers: [],
  bookies: [],
  statistics: {
    totalOpportunities: 0,
    profitableOpportunities: 0,
    totalPotentialProfit: 0,
    averageProfit: 0,
    successRate: 0,
  },
  isConnected: false,
  isLoading: true,
  error: null,
};

function surebetReducer(
  state: SurebetState,
  action: SurebetAction,
): SurebetState {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'SET_CONNECTED':
      return { ...state, isConnected: action.payload };

    case 'SET_ARBERS':
      return { ...state, arbers: action.payload };

    case 'ADD_ARBER':
      return { ...state, arbers: [...state.arbers, action.payload] };

    case 'UPDATE_ARBER':
      return {
        ...state,
        arbers: state.arbers.map((arber) =>
          arber.id === action.payload.id
            ? { ...arber, ...action.payload.updates }
            : arber,
        ),
      };

    case 'REMOVE_ARBER':
      return {
        ...state,
        arbers: state.arbers.filter((arber) => arber.id !== action.payload),
      };

    case 'SET_BOOKIES':
      return { ...state, bookies: action.payload };

    case 'UPDATE_BOOKIE':
      return {
        ...state,
        bookies: state.bookies.map((bookie) =>
          bookie.id === action.payload.id
            ? { ...bookie, ...action.payload.updates }
            : bookie,
        ),
      };

    case 'SET_STATISTICS':
      return { ...state, statistics: action.payload };

    case 'ADD_OPPORTUNITIES':
      return {
        ...state,
        arbers: state.arbers.map((arber) =>
          arber.id === action.payload.arberId
            ? {
                ...arber,
                opportunities: [
                  ...arber.opportunities,
                  action.payload.opportunities,
                ],
              }
            : arber,
        ),
      };

    default:
      return state;
  }
}

interface SurebetContextType extends SurebetState {
  dispatch: React.Dispatch<SurebetAction>;
  // Actions
  connectWebSocket: () => Promise<void>;
  disconnectWebSocket: () => void;
  pauseArber: (id: string) => void;
  resumeArber: (id: string) => void;
  closeArber: (id: string) => void;
  updateInvestment: (
    id: string,
    investment: { amount: number; currency: string },
  ) => void;
  refreshData: () => Promise<void>;
}

const SurebetContext = createContext<SurebetContextType | undefined>(undefined);

interface SurebetProviderProps {
  children: ReactNode;
}

export function SurebetProvider({ children }: SurebetProviderProps) {
  const [state, dispatch] = useReducer(surebetReducer, initialState);

  // Configuration des écouteurs WebSocket
  useEffect(() => {
    const setupWebSocketListeners = () => {
      // Événements de connexion
      wsService.on('connect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: true });
        dispatch({ type: 'SET_ERROR', payload: null });
      });

      wsService.on('disconnect', () => {
        dispatch({ type: 'SET_CONNECTED', payload: false });
      });

      // Événements des arbers
      wsService.on('arber_created', (data) => {
        dispatch({ type: 'ADD_ARBER', payload: data });
      });

      wsService.on('arber_status_updated', (data) => {
        dispatch({
          type: 'UPDATE_ARBER',
          payload: { id: data.id, updates: { status: data.status } },
        });
      });

      wsService.on('arber_investment_updated', (data) => {
        dispatch({
          type: 'UPDATE_ARBER',
          payload: { id: data.id, updates: { investment: data.investment } },
        });
      });

      wsService.on('arber_closed', (data) => {
        dispatch({ type: 'REMOVE_ARBER', payload: data.id });
      });

      // Événements des bookies
      wsService.on('bookie_created', (data) => {
        const existingBookieIndex = state.bookies.findIndex(
          (b) => b.id === data.id,
        );
        if (existingBookieIndex === -1) {
          dispatch({ type: 'SET_BOOKIES', payload: [...state.bookies, data] });
        }
      });

      wsService.on('bookie_status_updated', (data) => {
        dispatch({
          type: 'UPDATE_BOOKIE',
          payload: { id: data.id, updates: { status: data.status } },
        });
      });

      wsService.on('bookie_balance_updated', (data) => {
        dispatch({
          type: 'UPDATE_BOOKIE',
          payload: { id: data.id, updates: { balance: data.amount } },
        });
      });

      // Nouvelles opportunités d'arbitrage
      wsService.on('opportunities_found', (data) => {
        dispatch({
          type: 'ADD_OPPORTUNITIES',
          payload: { arberId: data.arberId, opportunities: data.opportunities },
        });
      });

      // Messages d'erreur
      wsService.on('error', (data) => {
        dispatch({ type: 'SET_ERROR', payload: data.message });
      });
    };

    setupWebSocketListeners();

    return () => {
      wsService.disconnect();
    };
  }, []);

  // Actions
  const connectWebSocket = async () => {
    try {
      dispatch({ type: 'SET_LOADING', payload: true });
      const connected = await wsService.connect();
      if (connected) {
        await refreshData();
      }
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Échec de la connexion WebSocket',
      });
    } finally {
      dispatch({ type: 'SET_LOADING', payload: false });
    }
  };

  const disconnectWebSocket = () => {
    wsService.disconnect();
    dispatch({ type: 'SET_CONNECTED', payload: false });
  };

  const pauseArber = (id: string) => {
    wsService.pauseArber(id);
  };

  const resumeArber = (id: string) => {
    wsService.resumeArber(id);
  };

  const closeArber = (id: string) => {
    wsService.closeArber(id);
  };

  const updateInvestment = (
    id: string,
    investment: { amount: number; currency: string },
  ) => {
    wsService.updateInvestment(id, investment);
  };

  const refreshData = async () => {
    try {
      const [arbers, bookies, statistics] = await Promise.all([
        apiService.getArbers(),
        apiService.getBookies(),
        apiService.getStatistics(),
      ]);

      dispatch({ type: 'SET_ARBERS', payload: arbers });
      dispatch({ type: 'SET_BOOKIES', payload: bookies });
      dispatch({ type: 'SET_STATISTICS', payload: statistics });
    } catch (error) {
      dispatch({
        type: 'SET_ERROR',
        payload: 'Erreur lors du chargement des données',
      });
    }
  };

  const contextValue: SurebetContextType = {
    ...state,
    dispatch,
    connectWebSocket,
    disconnectWebSocket,
    pauseArber,
    resumeArber,
    closeArber,
    updateInvestment,
    refreshData,
  };

  return (
    <SurebetContext.Provider value={contextValue}>
      {children}
    </SurebetContext.Provider>
  );
}

export function useSurebet() {
  const context = useContext(SurebetContext);
  if (context === undefined) {
    throw new Error('useSurebet must be used within a SurebetProvider');
  }
  return context;
}
