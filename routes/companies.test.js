
const request = require("supertest");

const app = require("../app");
const { createData } = require("../_test-common");
const db = require("../db");

// before each test, clean out data
beforeEach(createData);

afterAll(async () => {
  await db.end()
})

describe("GET /", function () {

  test("It should respond with array of companies", async function () {
    const response = await request(app).get("/companies");
    expect(response.body).toEqual({
      "companies": [
        {code: "apple", name: "Apple"},
        {code: "ibm", name: "IBM"},
      ]
    });
  })

});


describe("GET /apple", function () {

  test("It return company info", async function () {
    const response = await request(app).get("/companies/apple");
    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "Apple",
            description: "Maker of OSX.",
            invoices: [1, 2],
          }
        }
    );
  });

  test("It should return 404 for no-such-company", async function () {
    const response = await request(app).get("/companies/blargh");
    expect(response.status).toEqual(404);
  })
});


describe("POST /", function () {

  test("It should add company", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "TacoTime", description: "Yum!"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "tacotime",
            name: "TacoTime",
            description: "Yum!",
          }
        }
    );
  });

  test("It should return 500 for conflict", async function () {
    const response = await request(app)
        .post("/companies")
        .send({name: "Apple", description: "Huh?"});

    expect(response.status).toEqual(500);
  })
});


describe("PUT /", function () {

  test("It should update company", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({name: "AppleEdit", description: "NewDescrip"});

    expect(response.body).toEqual(
        {
          "company": {
            code: "apple",
            name: "AppleEdit",
            description: "NewDescrip",
          }
        }
    );
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .put("/companies/blargh")
        .send({name: "Blargh"});

    expect(response.status).toEqual(404);
  });

  test("It should return 500 for missing data", async function () {
    const response = await request(app)
        .put("/companies/apple")
        .send({});

    expect(response.status).toEqual(500);
  })
});


describe("DELETE /", function () {

  test("It should delete company", async function () {
    const response = await request(app)
        .delete("/companies/apple");

    expect(response.body).toEqual({"status": "deleted"});
  });

  test("It should return 404 for no-such-comp", async function () {
    const response = await request(app)
        .delete("/companies/blargh");

    expect(response.status).toEqual(404);
  });
});

describe("Industries Routes", () => {
    test("Add an industry", async () => {
      const response = await request(app)
        .post("/companies/industries")
        .send({ code: "market", industry: "Marketing" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        industry: {
          code: "market",
          industry: "Marketing",
        },
      });
    });
  
    test("List all industries", async () => {
      const response = await request(app).get("/companies/industries");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        industries: [
          { code: "acct", industry: "Accounting", companies: ["apple"] },
          { code: "tech", industry: "Technology", companies: ["ibm"] },
        ],
      });
    });
  
    test("Associate an industry with a company", async () => {
      const response = await request(app)
        .post("/companies/apple/industries")
        .send({ industry: "tech" });
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        company: {
          code: "apple",
          name: "Apple",
          description: "Maker of OSX.",
          invoices: [1, 2],
          industries: ["tech"],
        },
      });
    });
  });
  
  describe("GET /companies/:code", () => {
    test("It should respond with company details and associated industries", async () => {
      const response = await request(app).get("/companies/apple");
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual({
        company: {
          code: "apple",
          name: "Apple",
          description: "Maker of OSX.",
          invoices: [1, 2],
          industries: ["acct"],
        },
      });
    });
  });