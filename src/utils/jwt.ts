import { config } from "@/config/config";
import jwt, { JwtPayload } from "jsonwebtoken";

type Token = "access" | "refresh";

type CustomJwtPayload = jwt.JwtPayload & {
  userId: string;
  tokenType: string;
};

export const generateToken = (userId: string, tokenType: Token): string => {
  try {
    const now = Date.now();
    let token_lifetime = parseInt(config.ACCESS_TOKEN_LIFETIME);

    if (tokenType === "refresh") {
      token_lifetime = parseInt(config.REFRESH_TOKEN_LIFETIME);
    }

    const expired = new Date(now + token_lifetime * 1000).getTime();
    const payload: jwt.JwtPayload = {
      iss: "backend-auth",
      iat: now,
      exp: expired,
      sub: userId,
      userId: userId,
      tokenType: tokenType,
    };

    const token = jwt.sign(payload, config.PRIVATE_KEY, {
      algorithm: config.ALGORITHM as jwt.Algorithm,
    });

    return token;
  } catch (error) {
    throw error;
  }
};

const validateToken = (token: string, tokenType: Token) => {
  try {
    const payload = jwt.decode(token);
    // TODO : check payload condition before returing
    return payload;
  } catch (error) {
    throw error;
  }
};

export const verifyToken = (token: string): CustomJwtPayload => {
  try {
    return jwt.verify(token, config.PUBLIC_KEY, {
      algorithms: [config.ALGORITHM as jwt.Algorithm],
    }) as CustomJwtPayload;
  } catch (error) {
    throw error;
  }
};

export const generateTokenPair = (userId: string) => {
  const accessToken = generateToken(userId, "access");
  const refreshToken = generateToken(userId, "refresh");

  return {
    accessToken,
    refreshToken,
  };
};
