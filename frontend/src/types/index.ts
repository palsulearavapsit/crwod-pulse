export interface Zone {
  id: string;
  name: string;
  type: 'gate' | 'concession' | 'seating' | 'restroom';
  waitTime: number;
  congestion: 'green' | 'yellow' | 'red';
  isVip?: boolean;
  isClosed?: boolean;
}

export interface Alert {
  id: number;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'promo';
  timestamp: string;
}

export interface VenueState {
  zones: Zone[];
  alerts: Alert[];
  kpis: {
    totalFans?: number;
    averageWait?: number;
    activeAnomalies?: number;
    activeAlerts?: number;
  };
}

export interface User {
  uid: string;
  email: string | null;
  role: 'admin' | 'attendee';
}
