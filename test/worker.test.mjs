import assert from "node:assert/strict";
import test from "node:test";
import worker from "../brief-api/src/index.mjs";

function env() {
  const saved = [];
  return {
    saved,
    DB: {
      prepare() {
        return {
          bind(...values) {
            return {
              async run() {
                saved.push(values);
                return { success: true };
              }
            };
          }
        };
      }
    }
  };
}

test("worker stores raw answers and generated brief fields", async () => {
  const bindings = env();
  const request = new Request("https://brief.example.com/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://zazoo.me"
    },
    body: JSON.stringify({
      name: "Ada",
      email: "ada@example.com",
      profession: "Founder",
      answers: [3, 3, 4, 4, 3, 3, 4]
    })
  });

  const response = await worker.fetch(request, bindings);

  assert.equal(response.status, 201);
  assert.equal(bindings.saved.length, 1);
  assert.match(bindings.saved[0].join(" "), /Ada/);
  assert.match(bindings.saved[0].join(" "), /Shared Workflow Maturity/);
});

test("worker rejects incomplete submissions", async () => {
  const response = await worker.fetch(new Request("https://brief.example.com/submissions", {
    method: "POST",
    headers: {
      "content-type": "application/json",
      origin: "https://zazoo.me"
    },
    body: JSON.stringify({ answers: [1, 2] })
  }), env());

  assert.equal(response.status, 400);
});
