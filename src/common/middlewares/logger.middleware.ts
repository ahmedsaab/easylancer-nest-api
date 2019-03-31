let i = 0;

export function logger(req, res, next) {
  console.log(`Request...${i}`);
  i += 1;
  next();
}
