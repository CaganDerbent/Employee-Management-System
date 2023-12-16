const dotenv = require('dotenv');
dotenv.config();

const HOST = process.env.HOST;
const USER = process.env.USER;
const PASSWORD = process.env.PASSWORD;
const NAME = process.env.NAME;
const PORT = process.env.PORT;

const express = require("express");
const mysql = require("mysql");
const bodyParser = require('body-parser');



const cors = require("cors");

const app = express();
app.use(express.json());
app.use(bodyParser.json());

app.use((req,res,next)=>{
  console.log(req.path,req.method);
  next();
})

  app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "DELETE", "PUT"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }));

app.listen(PORT,()=> console.log(`Server Running on ${PORT}`));

app.get("/",(req,res)=>{
    res.status(200).json("naber");
})


const db = mysql.createConnection({
  host:HOST,
  user:USER,
  password:PASSWORD,
  database:NAME
})

/*host:"localhost",
user:"root",
password:"Rootcugan",
database:"Employees"*/



app.get("/data",(req,res)=>{
    const q = "SELECT * FROM Registrations";

    db.query(q,(err,data)=>{
        if(err){
            return res.status(401).json(err);
        }
        else{
            return res.status(200).json(data);
        }

    })
});

app.post("/data", (req,res)=>{

    const registinfo = req.body;

    const innerQuery = "SELECT MAX(EmployeeID) as LastEmployeeID FROM Employee";
   
    const q = "INSERT INTO Registrations(`EmployeeID`, `DepartmentID`, `PositionID`, `Date`) VALUES (?, ?, ?, ?)"; //( " + innerQuery + " )

    db.query(innerQuery, (innerErr, innerData) => {
        if (innerErr) {
            console.log(innerErr);
            return res.status(500).json(innerErr);
        }

        const lastEmployeeID = innerData[0].LastEmployeeID;

        db.query(q, [lastEmployeeID, registinfo.DepartmentID, registinfo.PositionID, registinfo.Date], (err, data) => {
            if (err) {
                console.log(err);
                return res.status(500).json(err);
            } else {
                console.log(data);
                return res.status(200).json({ success: "kayıt başarılı", lastEmployeeID });
            }
        });
    });

    
    
});

app.get("/data/departments",(req,res)=>{
    const q = "SELECT * FROM Department";

    db.query(q,(err,data)=>{
        if(err){
            return res.status(401).json(err);
        }
        else{
            return res.status(200).json(data);
        }

    })
});

app.get("/data/positions",(req,res)=>{
    const q = "SELECT * FROM Position";

    db.query(q,(err,data)=>{
        if(err){
            return res.status(401).json(err);
        }
        else{
            return res.status(200).json(data);
        }

    })
});

app.get("/data/employees",(req,res)=>{
    const q = "SELECT * FROM Employee";

    db.query(q,(err,data)=>{
        if(err){
            return res.status(401).json(err);
        }
        else{
            return res.status(200).json(data);
        }

    })
});

app.get("/data/employees/reverse",(req,res)=>{
  const q = "SELECT * FROM Employee ORDER BY EmployeeID DESC";

  db.query(q,(err,data)=>{
      if(err){
          return res.status(401).json(err);
      }
      else{
          return res.status(200).json(data);
      }

  })
});

app.get("/data/employees/value",(req,res)=>{
  const q = "SELECT COUNT(EmployeeID) FROM Employee";

  db.query(q,(err,data)=>{
      if(err){
          return res.status(401).json(err);
      }
      else{
          return res.status(200).json(data);
      }

  })
});

app.get("/data/employees/:EmployeeID",(req,res)=>{
  const EmployeeID = req.params.EmployeeID
  const q = "SELECT * FROM Employee WHERE EmployeeID = ?";

  db.query(q,[EmployeeID],(err,data)=>{
      if(err){
          return res.status(401).json(err);
      }
      else{
          return res.status(200).json(data);
      }

  })
});

app.get("/data/employees/name/:Name",(req,res)=>{
  const q = "SELECT * FROM Employee WHERE Name LIKE ?";
  const Name = '%' + req.params.Name + '%'; 

  db.query(q,[Name],(err,data)=>{
      if(err){
          return res.status(401).json(err);
      }
      else{
          return res.status(200).json(data);
      }

  })
});

app.post("/data/employees", (req, res) => {
    const q = "INSERT INTO Employee(`Name`, `Surname`, `phoneNumber`, `Age`, `Salary`) VALUES (?, ?, ?, ?, ?)";
    const info = req.body;

    db.query(q, [info.Name , info.Surname, info.phoneNumber ,info.Age, info.Salary], (err, data) => {
        if (err) {
            console.log(err);
            return res.status(401).json(err);
        } else {
            console.log(data);
            return res.status(200).json(data);
        }
    });


});

  app.delete("/data/employees/:EmployeeID", (req, res) => {
    const EmployeeID = req.params.EmployeeID;
    console.log(EmployeeID, req.headers);
  
    const q = "DELETE FROM Employee WHERE EmployeeID = ?";
    const q2 = "DELETE FROM Registrations WHERE EmployeeID = ?";
  
    Promise.all([
      new Promise((resolve, reject) => {
        db.query(q2, [EmployeeID], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }),
      new Promise((resolve, reject) => {
        db.query(q, [EmployeeID], (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }),
    ])
      .then(([result1, result2]) => {
        return res.status(200).json({ result1, result2 });
      })
      .catch((err) => {
        console.error(err);
        return res.status(500).json({ error: "Internal Server Error", details: err.message });
      });
  });

  app.put("/data/employees/:EmployeeID", (req, res) => {
    const EmployeeID = req.params.EmployeeID;
    const info = req.body;
  
    const q = "UPDATE Employee SET `Name` = ?, `Surname` = ?, `phoneNumber` = ?, `Age` = ?, `Salary` = ? WHERE EmployeeID = ?";
  
    try {
      db.query(q, [info.Name, info.Surname, info.phoneNumber, info.Age, info.Salary, EmployeeID], (err, data) => {
        if (err) {
          return res.status(400).json(err);
        } else {
          return res.status(200).json(data);
        }
      });
    } catch (err) {
      console.log(err);
    }
  });

app.put("/data/:EmployeeID",(req,res)=>{
  const EmployeeID = req.params.EmployeeID;
  const registinfo = req.body;

  console.log(registinfo)

  const q = "UPDATE Registrations SET `DepartmentID` = ?, `PositionID` = ?, `Date` = ? WHERE EmployeeID = ?";

  try {
    db.query(q, [registinfo.DepartmentID,registinfo.PositionID,registinfo.Date ,EmployeeID], (err, data) => {
      if (err) {
        console.log(err)
        return res.status(400).json(err);
      } else {
        return res.status(200).json(data);
      }
    });
  } catch (err) {
    console.log(err);
  }

})

app.get("/data/join",(req,res)=>{
  const q = "SELECT * FROM Registrations INNER JOIN Employee ON Registrations.EmployeeID = Employee.EmployeeID";

  db.query(q,(err,data)=>{
      if(err){
          return res.status(401).json(err);
      }
      else{
          return res.status(200).json(data);
      }

  })
});

app.get("/data/groups/:number",(req,res)=>{
  const number = req.params.number;
  const q = "SELECT DepartmentID, COUNT(*) FROM Registrations GROUP BY DepartmentID HAVING COUNT(*) >= ? ";


  db.query(q,[number],(err,data)=>{
      if(err){
          return res.status(401).json(err);
      }
      else{
          return res.status(200).json(data);
      }

  })
});

