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
      "INSERT INTO reservations (guess, venueId, wantsCaterin, reservationDate, customerName, email, phone, active, partyType) VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8) RETURNING reservation_id;",
      [body.guess, body.venueId, body.wantsCaterin, body.reservationDate, body.customerName, body.email, body.phone, body.partytype]
    )
    res.json({reservation_id : queryResult.rows[0].reservation_id })
   } catch (e) {
     res.status(500).json({error: e.message});
   }
});


app.get("/reservation", async (req, res) => {
    try{
      const queryResult = await pgClient.query("SELECT * FROM reservations")
      let html = `<!DOCTYPE html>
      <html>
      <head>
      <style>
      table {
        font-family: arial, sans-serif;
        border-collapse: collapse;
        width: 100%;
      }
      
      td, th {
        border: 1px solid #dddddd;
        text-align: left;
        padding: 8px;
      }
      
      tr:nth-child(even) {
        background-color: #dddddd;
      }
      </style>
      </head>
      <body>
      
      <h2>Reservations</h2>
      
      <table>
        <tr>
          <th>Id</th>
          <th>Guests</th>
          <th>Venue ID</th>
          <th>Wants Caterin</th>
          <th>Reservationdate</th>
          <th>Customername</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Active</th>
          <th>Party Type</th>
        </tr>`;

        queryResult.rows.forEach( row => {
            html += `<tr>
            <td>${row.reservation_id}</td>
            <td>${row.guess}</td>
            <td>${row.venueid}</td>
            <td>${row.wantscaterin}</td>
            <td>${row.reservationdate}</td>
            <td>${row.customername}</td>
            <td>${row.email}</td>
            <td>${row.phone}</td>
            <td>${row.active}</td>
            <td>${row.partytype}</td>
            </tr>`
        })
        html += `</table>

        </body>
        </html>`;
      res.setHeader('Content-type','text/html');
      res.send(html)
    } catch (e) {
      res.status(500).json({error: e.message});
    }
  }
  );

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
