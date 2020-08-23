export interface IQuestion {
  text: string;
  unit: string;
}

export const getXMockQuestions = (num): IQuestion[] => {
  return [...Array(num)].map((_) => ({
    text: "how many are there #player " + Math.random(),
    unit: "units",
  }));
};
