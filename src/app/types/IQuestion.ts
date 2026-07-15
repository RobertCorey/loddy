export interface IQuestion {
  text: string;
  unit: string;
  // safe for a corporate icebreaker: no booze, dating, gambling, etc.
  sfw: boolean;
}

export const getXMockQuestions = (num): IQuestion[] => {
  return [...Array(num)].map((_) => ({
    text: "how many are there #player " + Math.random(),
    unit: "units",
    sfw: true,
  }));
};
