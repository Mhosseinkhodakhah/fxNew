import { UUIDTypes, v4 as uuidv4 } from "uuid";
import winston from "winston";

export default (req: any, res: any, next: any) => {
  let uuid: UUIDTypes = uuidv4();
  req.headers.corelationId = uuid;
  winston.info("corelationId add to req", req.headers.corelationId);
  next();
};
