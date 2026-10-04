import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";
import { describe, beforeEach, it } from "mocha";

describe("healthRepository", () => {
  let queryRawStub: sinon.SinonStub;
  let loggerErrorStub: sinon.SinonStub;
  let healthRepository: () => Promise<boolean>;

  beforeEach(() => {
    queryRawStub = sinon.stub();
    loggerErrorStub = sinon.stub();

    ({ healthRepository } = proxyquire.noCallThru()("../../../repositories/health.repository", {
      "@/utils/prisma": {
        __esModule: true,
        default: { $queryRaw: queryRawStub },
      },
      "@/utils/logger": {
        __esModule: true,
        default: { error: loggerErrorStub },
      },
    }));
  });

  it("returns true when the DB query succeeds", async () => {
    queryRawStub.resolves([{ "?column?": 1 }]);
    expect(await healthRepository()).to.equal(true);
    expect(queryRawStub.calledOnce).to.equal(true);
    expect(loggerErrorStub.called).to.equal(false);
  });

  it("runs SELECT 1 as the query", async () => {
    queryRawStub.resolves([]);
    await healthRepository();
    const [strings] = queryRawStub.firstCall.args;
    expect(strings[0]).to.equal("SELECT 1");
  });

  it("returns false and logs the error when the DB query fails", async () => {
    const dbError = new Error("Connection refused");
    queryRawStub.rejects(dbError);

    expect(await healthRepository()).to.equal(false);
    expect(loggerErrorStub.calledOnceWith("Error while checking db connection", dbError)).to.equal(
      true,
    );
  });
});
