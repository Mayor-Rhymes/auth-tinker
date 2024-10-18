import { randomBytes } from "crypto";


export const generate_session = () => {
  const randoVal = randomBytes(15);
  return randoVal.toString("base64");
};

console.log(generate_session());
