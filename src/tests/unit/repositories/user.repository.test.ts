import { expect } from "chai";
import sinon from "sinon";
import proxyquire from "proxyquire";
import { describe, beforeEach, it } from "mocha";

describe("user.repository", () => {
  let createStub: sinon.SinonStub;
  let findUniqueStub: sinon.SinonStub;
  let repo: typeof import("@/repositories/user.repository");

  beforeEach(() => {
    createStub = sinon.stub();
    findUniqueStub = sinon.stub();

    repo = proxyquire.noCallThru()("../../../repositories/user.repository", {
      "@/utils/prisma": {
        __esModule: true,
        default: {
          user: { create: createStub, findUnique: findUniqueStub },
        },
      },
    });
  });

  describe("createUser", () => {
    const input = {
      name: "Suraj",
      username: "suraj",
      email: "suraj@example.com",
    } as any;

    it("creates the user and selects only id and name", async () => {
      const created = { id: "u1", name: "Suraj" };
      createStub.resolves(created);

      const result = await repo.createUser(input);

      expect(result).to.deep.equal(created);
      expect(createStub.calledOnce).to.equal(true);
      expect(createStub.firstCall.args[0]).to.deep.equal({
        data: input,
        select: { id: true, name: true },
      });
    });

    it("propagates errors from prisma", async () => {
      const err = new Error("Unique constraint failed");
      createStub.rejects(err);

      try {
        await repo.createUser(input);
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).to.equal(err);
      }
    });
  });

  describe("findUserByUserName", () => {
    it("looks up a non-deleted user by username and selects email", async () => {
      findUniqueStub.resolves({ email: "suraj@example.com" });

      const result = await repo.findUserByUserName("suraj");

      expect(result).to.deep.equal({ email: "suraj@example.com" });
      expect(findUniqueStub.firstCall.args[0]).to.deep.equal({
        where: { isDeleted: false, username: "suraj" },
        select: { email: true },
      });
    });

    it("returns null when no user is found", async () => {
      findUniqueStub.resolves(null);
      expect(await repo.findUserByUserName("ghost")).to.equal(null);
    });
  });

  describe("findUserByEmail", () => {
    it("looks up a non-deleted user by email and selects id and name", async () => {
      findUniqueStub.resolves({ id: "u1", name: "Suraj" });

      const result = await repo.findUserByEmail("suraj@example.com");

      expect(result).to.deep.equal({ id: "u1", name: "Suraj" });
      expect(findUniqueStub.firstCall.args[0]).to.deep.equal({
        where: { isDeleted: false, email: "suraj@example.com" },
        select: { id: true, name: true },
      });
    });

    it("returns null when no user is found", async () => {
      findUniqueStub.resolves(null);
      expect(await repo.findUserByEmail("none@example.com")).to.equal(null);
    });
  });

  describe("findUserByUserId", () => {
    it("looks up a non-deleted user by id and selects only id", async () => {
      findUniqueStub.resolves({ id: "u1" });

      const result = await repo.findUserByUserId("u1");

      expect(result).to.deep.equal({ id: "u1" });
      expect(findUniqueStub.firstCall.args[0]).to.deep.equal({
        where: { id: "u1", isDeleted: false },
        select: { id: true },
      });
    });

    it("propagates errors from prisma", async () => {
      const err = new Error("DB down");
      findUniqueStub.rejects(err);

      try {
        await repo.findUserByUserId("u1");
        expect.fail("should have thrown");
      } catch (e) {
        expect(e).to.equal(err);
      }
    });
  });

  describe("findUserDetailsByUserId", () => {
    it("omits sensitive fields", async () => {
      const details = { id: "u1", name: "Suraj", username: "suraj" };
      findUniqueStub.resolves(details);

      const result = await repo.findUserDetailsByUserId("u1");

      expect(result).to.deep.equal(details);
      expect(findUniqueStub.firstCall.args[0]).to.deep.equal({
        where: { id: "u1", isDeleted: false },
        omit: {
          email: true,
          contactNumber: true,
          signInProvider: true,
          signInProviderId: true,
          isDeleted: true,
        },
      });
    });

    it("returns null when no user is found", async () => {
      findUniqueStub.resolves(null);
      expect(await repo.findUserDetailsByUserId("missing")).to.equal(null);
    });
  });
});
