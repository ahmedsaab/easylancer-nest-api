let i = 0;

export function counter(req, res, next) {
  // TODO: fetches the last i from the previous log
  // TODO: publish to splunk when i reaches a certain threshold
  req.number = i++;
  next();
}
