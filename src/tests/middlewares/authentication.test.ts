import { authenticate } from "@/middlewares/authenticate";
import { expect } from "chai";
import { afterEach, describe, it } from "mocha";
import Sinon from "sinon";
import { TEST_USERS } from "../fixtures/user";
import { config } from "@/config/config";

const jwt = await import("@/utils/jwt");
const userService = await import("@/services/user.services");

describe.only("Authentication Middleware", () => {
  afterEach(() => {
    Sinon.restore();
  });

  it("should allow authorized user with valid token", async () => {
    const req = {
      cookies: {
        [config.ACCESS_TOKEN_NAME]: "validToken",
      },
    };
    const res = {
      status: Sinon.stub().returnsThis(),
      json: Sinon.stub(),
    };
    const testToken = "validToken";
    const nextSpy = Sinon.spy();
    const testUserId = TEST_USERS[0].id;

    const verifyTokenStub = Sinon.stub(jwt, "verifyToken").returns({
      userId: testUserId,
      tokenType: "access",
    });
    const getUserDetailsByUserIdStub = Sinon.stub(userService, "getUserDetailsByUserId").resolves({
      id: testUserId,
    });

    await authenticate(req, res, nextSpy);

    expect(nextSpy.calledOnce).to.equal(true);
  });
});
