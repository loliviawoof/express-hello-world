const express = require("express");
const app = express();
const port = process.env.PORT || 3001;

const {Client} = require("pg")

console.log("Conecting to " + process.env.PG)
const pgClient = new Client(process.env.PG);
pgClient.connect()
  .then(() => console.log("Database connected"))
  .catch(e => console.error("Error on database conection : " + e.message))

app.use(express.json())

app.get("/venues/find", async (req, res) => {
  try{
   const guest = req.query.guest
   const indoorsoutdoors = req.query.indoorsoutdoors 

   const queryResult = await pgClient.query(
    "SELECT * FROM venues WHERE maxpeople > $1 and indoorsoutdoors = $2",
     [parseInt(guest), indoorsoutdoors ]
    )

   res.json({reservations : queryResult.rows })
  } catch (e) {
    res.status(500).json({error: e.message});
  }
  }
);

app.get("/venues", async (req, res) => {
  try{
   const queryResult = await pgClient.query(
    "SELECT * FROM venues")

   res.json({venues : queryResult.rows })
  } catch (e) {
    res.status(500).json({error: e.message});
  }
  }
);


app.post("/reservation", async (req, res) => {
  try{
    const body = req.body;
    const queryResult = await pgClient.query(
      "INSERT INTO reservations (guess, venueId, wantsCaterin, reservationDate, customerName, email, phone, active) VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING reservation_id;",
      [body.guess, body.venueId, body.wantsCaterin, body.reservationDate, body.customerName, body.email, body.phone]
    )
    res.json({reservations : queryResult.rows })
   } catch (e) {
     res.status(500).json({error: e.message});
   }
});


app.get("/reservation/:id", async (req, res) => {
  try{
    const queryResult = await pgClient.query("SELECT * FROM reservations WHERE reservation_id = $1", [req.params.id])
    
    res.json({reservations : queryResult.rows })
  } catch (e) {
    res.status(500).json({error: e.message});
  }
}
);

app.delete("/reservation/:id", async (req, res) => {
  try{
    const queryResult = await pgClient.query(
      "UPDATE reservations SET active = false WHERE reservation_id = $1", [req.params.id])
    res.json({reservations : queryResult.rows })
   } catch (e) {
     res.status(500).json({error: e.message});
   }
});

app.listen(port, () => console.log(`Example app listening on port ${port}!`));
