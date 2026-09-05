export type BackendHealth = {
  status: string;
  application: string;
};

export type ConnectionStatus = "checking" | "connected" | "offline";