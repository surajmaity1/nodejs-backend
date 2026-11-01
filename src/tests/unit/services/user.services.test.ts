import { TEST_USERS } from "@/tests/fixtures/user";
import { describe, it } from "mocha";
import Sinon from "sinon";
import { expect } from "chai";
import esmock from "esmock";

describe("getUserDetailsByUserId", () => {
  const testUserId = TEST_USERS[0].id;

  it("should fetch id of user without user details", async () => {
    const findUserByUserId = Sinon.stub().resolves({ id: testUserId });
    const { getUserDetailsByUserId } = await esmock("../../../services/user.services", {
      "../../../repositories/user.repository": { findUserByUserId },
    });
    const userDetails = await getUserDetailsByUserId(testUserId, false);

    expect(findUserByUserId.calledOnce).to.equal(true);
    expect(await findUserByUserId.getCall(0).returnValue).to.have.property("id", testUserId);
    expect(userDetails).to.have.property("id", testUserId);
  });

  it("should fetch user details for valid userId", async () => {
    const testUser = TEST_USERS[0];

    const findUserDetailsByUserId = Sinon.stub().resolves({
      name: testUser.name,
      id: testUser.id,
      username: testUser.username,
      image: testUser.image,
      createdAt: testUser.createdAt,
      updatedAt: testUser.updatedAt,
    });
    const { getUserDetailsByUserId } = await esmock("../../../services/user.services", {
      "../../../repositories/user.repository": { findUserDetailsByUserId },
    });
    const userDetails = await getUserDetailsByUserId(testUser.id, true);

    expect(findUserDetailsByUserId.calledOnce).to.equal(true);
    expect(await findUserDetailsByUserId.getCall(0).returnValue).to.have.property(
      "id",
      testUser.id,
    );
    expect(userDetails).to.have.property("id", testUser.id);
    expect(userDetails).to.have.property("name", testUser.name);
    expect(userDetails).to.have.property("username", testUser.username);
    expect(userDetails).to.have.property("image", testUser.image);
    expect(userDetails).to.have.property("createdAt", testUser.createdAt);
    expect(userDetails).to.have.property("updatedAt", testUser.updatedAt);
  });

  it("should handle error in getUserDetailsByUserId", async () => {
    const customTestError = new Error("Database connection failed");
    const findUserByUserId = Sinon.stub().rejects(customTestError);
    const { getUserDetailsByUserId } = await esmock("../../../services/user.services", {
      "../../../repositories/user.repository": { findUserByUserId },
    });

    try {
      await getUserDetailsByUserId(testUserId, false);
    } catch (error) {
      expect(error).to.equal(customTestError);
    }
  });
});
