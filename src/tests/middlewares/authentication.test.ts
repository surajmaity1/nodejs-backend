import { expect } from "chai";
import { afterEach, beforeEach, describe, it } from "mocha";
import Sinon from "sinon";
import { TEST_USERS } from "../fixtures/user";
import esmock from "esmock";

describe("Authentication Middleware", () => {
  let req, res, nextSpy, testUserId: string;

  beforeEach(() => {
    req = {
      cookies: {
        ["backend_access"]: "validToken",
      },
    };
    res = {
      status: Sinon.stub().returnsThis(),
      json: Sinon.stub(),
    };
    nextSpy = Sinon.spy();
    testUserId = TEST_USERS[0].id;
  });

  afterEach(() => {
    Sinon.restore();
  });

  it("should allow authorized user with valid token", async () => {
    const verifyToken = Sinon.stub().returns({ userId: testUserId, tokenType: "access" });
    const getUserDetailsByUserId = Sinon.stub().resolves({ id: testUserId });

    const { authenticate } = await esmock("../../middlewares/authenticate", {
      "../../utils/jwt": { verifyToken },
      "../../services/user.services": { getUserDetailsByUserId },
    });

    await authenticate(req, res, nextSpy);

    expect(verifyToken.calledWith("validToken")).to.equal(true);
    expect(verifyToken.calledOnce).to.equal(true);
    expect(verifyToken.returnValues[0]).to.deep.equal({
      userId: testUserId,
      tokenType: "access",
    });

    expect(getUserDetailsByUserId.calledOnce).to.equal(true);
    expect(await getUserDetailsByUserId.returnValues[0]).to.deep.equal({ id: testUserId });

    expect(res.status(401).json.notCalled).to.equal(true);
    expect(nextSpy.calledOnce).to.equal(true);
  });

  it("should deny access for invalid token", async () => {
    req.cookies["backend_access"] = "invalidToken";
    const verifyToken = Sinon.stub().throws(new Error("Invalid Token"));
    const { authenticate } = await esmock("../../middlewares/authenticate", {
      "../../utils/jwt": { verifyToken },
    });

    await authenticate(req, res, nextSpy);

    expect(verifyToken.calledOnce).to.equal(true);
    expect(verifyToken.calledWith("invalidToken")).to.equal(true);
    expect(verifyToken.threw()).to.equal(true);
    expect(verifyToken.exceptions[0].message).to.equal("Invalid Token");

    expect(nextSpy.notCalled).to.equal(true);
    expect(res.status(401).json.calledOnce).to.equal(true);
    expect(res.status(401).json.firstCall.args[0]).to.deep.equal({
      message: "Unauthenticated user",
    });
  });
});
