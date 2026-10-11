import app from "@/server";
import { request } from "chai-http";
import { afterEach, beforeEach, describe } from "mocha";
import { TEST_USERS } from "../fixtures/user";
import { expect } from "chai";
import Sinon from "sinon";
import prisma from "@/utils/prisma";

describe("Users", () => {
  const testUserId = TEST_USERS[0].id;
  let findUniqueStub: Sinon.SinonStub;

  describe("GET /users/:userId", () => {
    beforeEach(() => {
      findUniqueStub = Sinon.stub(prisma.user, "findUnique").resolves(TEST_USERS[0]);
    });

    afterEach(() => {
      Sinon.restore();
    });

    it("should return 401 if not logged in", (done) => {
      request
        .execute(app)
        .get(`/v1/users/${testUserId}`)
        .end((err, res) => {
          if (err) {
            return done(err);
          }

          expect(res.statusCode).to.equal(401);
          expect(res.body.message).to.equal("Unauthenticated user");

          return done();
        });
    });
  });
});
