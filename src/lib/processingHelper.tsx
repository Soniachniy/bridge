export const PROCESS_KEY = "processing_step";

export const PROCESS_STEP = {
  GET_DEPOSIT_ADDRESS: "get_deposit_address",
  SEND_DEPOSIT: "send_deposit",
  GET_SIGNATURE: "get_signature",
  EXECUTE_BRDIGE: "execute_bridge",
};

export const saveStep = (step: string, data: any) => {
  localStorage.setItem(PROCESS_KEY, JSON.stringify({ ...data, step }));
};

export const getStep = () => {
  const data = localStorage.getItem(PROCESS_KEY);
  if (!data) return null;
  return JSON.parse(data);
};

export const removeStep = () => {
  localStorage.removeItem(PROCESS_KEY);
};
