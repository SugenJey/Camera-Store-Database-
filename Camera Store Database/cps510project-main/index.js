const express = require('express')
const app = express()
const port = 3000
const oracledb = require('oracledb');
oracledb.initOracleClient({ libDir: 'instantclient_21_12' });
require('dotenv').config()


app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Primary KEy
const PK = {
  "customer": "customerid",
  "equipment": "equipmentid",
  "camera": "equipmentid",
  "accessory": "equipmentid",
  "inventory": "itemid",
  "rental": "rentalid",
  "invoices": "invoiceid",
  "payment": "paymentid"
}

// Customer Table
const customerTableFields = ['CustomerID', 'CustomerName', 'MailingAddress', 'PhoneNumber', 'BillingAddress', 'Email'];
// Equipment Table
const equipmentTableFields = ['EquipmentID', 'Brand', 'Description', 'Name'];
// Camera Table
const cameraTableFields = ['EquipmentID', 'MegaPixel', 'Resolution', 'LensType', 'Aperture'];
// Accessory Table
const accessoryTableFields = ['EquipmentID', 'Weight', 'Color', 'AccessoryType'];
// Inventory Table
const inventoryTableFields = ['ItemID', 'RentalCost', 'AcquisitionDate', 'Condition', 'Availability', 'EquipmentID'];
// Rental Table
const rentalTableFields = ['RentalID', 'RentalDate', 'DueDate', 'ItemID', 'CustomerID', 'CompleteFlag'];
// Invoices Table
const invoicesTableFields = ['InvoiceID', 'PaymentStatus', 'DueDate', 'InvoiceCost', 'RentalID'];
// Payment Table
const paymentTableFields = ['PaymentID', 'PaymentDate', 'PaymentAmount', 'CustomerID', 'InvoiceID'];


// Primary KEy
const columnNames = {
  "customer": customerTableFields,
  "equipment": equipmentTableFields,
  "camera": cameraTableFields,
  "accessory": accessoryTableFields,
  "inventory": inventoryTableFields,
  "rental": rentalTableFields,
  "invoices": invoicesTableFields,
  "payment": paymentTableFields
}


function transformData(data) {
  try {
    const metadataNames = data.metaData.map(meta => meta.name);

    const resultArray = data.rows.map(row => {
      const rowObject = {};
      row.forEach((value, i) => {
        rowObject[metadataNames[i]] = value;
      });
      return rowObject;
    });

    return resultArray;
  } catch (error) {
    console.log(error);
    return (data);
  }
}

async function db(cmd) {
  try {
    console.log(cmd)
    const connection = await oracledb.getConnection({
      user: process.env.user,
      password: process.env.password,
      connectString: process.env.connectstring
    });
    const result = await connection.execute(cmd);
    connection.commit();
    await connection.close();

    if (cmd.includes("select")) {
      const updatedResult = transformData(result);
      return updatedResult;
    }

    return result

  } catch (error) {
    /* console.log(error) */
    return { error: error.message }
  }
}

/* Create Tables 
    Creates all the tables for the project
*/
app.get('/create', async (req, res) => {
  const result = [];
  result.push(await db("CREATE TABLE Customer( CustomerID  NUMBER PRIMARY KEY, CustomerName  VARCHAR2(128), MailingAddress     VARCHAR2(512), PhoneNumber CHAR(10), BillingAddress VARCHAR2(512), Email VARCHAR2(128) )"))
  result.push(await db("CREATE TABLE equipment( EquipmentID  NUMBER PRIMARY KEY, Brand VARCHAR2(10), Description VARCHAR2(100), Name VARCHAR2(50) )"))
  result.push(await db("CREATE TABLE Camera( EquipmentID   NUMBER PRIMARY KEY, MegaPixel NUMBER, Resolution NUMBER, LensType VARCHAR2(10), Aperture VARCHAR2(10), FOREIGN KEY (EquipmentID) REFERENCES equipment(EquipmentID) ON DELETE CASCADE)"))
  result.push(await db("CREATE TABLE accessory( EquipmentID   NUMBER PRIMARY KEY, Weight NUMBER(*,1), Color VARCHAR2(10), AccessoryType VARCHAR2(10), FOREIGN KEY (EquipmentID) REFERENCES equipment(EquipmentID) ON DELETE CASCADE)"))
  result.push(await db("CREATE TABLE inventory( ItemID   NUMBER PRIMARY KEY, RentalCost  NUMBER(*,2), AcquisitionDate    DATE, Condition VARCHAR2(20), Availability NUMBER(1), EquipmentID NUMBER, FOREIGN KEY (EquipmentID) REFERENCES equipment(EquipmentID) ON DELETE CASCADE)"))
  result.push(await db("CREATE TABLE Rental( RentalID  NUMBER PRIMARY KEY, RentalDate  DATE, DueDate    DATE, ItemID NUMBER, FOREIGN KEY (ItemID) REFERENCES inventory(ItemID) ON DELETE CASCADE, CustomerID NUMBER, FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE, CompleteFlag NUMBER(1) )"))
  result.push(await db("CREATE TABLE Invoices( InvoiceID  NUMBER PRIMARY KEY, PaymentStatus  NUMBER(1), DueDate     DATE, InvoiceCost NUMBER(*,2), RentalID NUMBER, FOREIGN KEY (RentalID) REFERENCES Rental(RentalID) ON DELETE CASCADE)"))
  result.push(await db("CREATE TABLE Payment( PaymentID NUMBER PRIMARY KEY, PaymentDate  DATE, PaymentAmount NUMBER(*,2), CustomerID NUMBER, InvoiceID NUMBER, FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID) ON DELETE CASCADE, FOREIGN KEY (CustomerID) REFERENCES Customer(CustomerID) ON DELETE CASCADE)"))
  res.send(result)
})

/* Read Tables 
    Reads whatever table is passed in tableID
*/
app.get('/table/:tableID', async (req, res) => {
  cmd = `select * from ${req.params.tableID}`
  const result = await db(cmd)
  res.send(result)
})

/* Populate Tables */
app.get('/populate', async (req, res) => {
  const result = [];
  result.push(await db("INSERT INTO equipment VALUES (1, 'Sony', 'Alpha A7 III', 'Mirrorless')"))
  result.push(await db("INSERT INTO camera VALUES (1, 24, 2020, 'Full Frame', 'f/2.8')"))
  result.push(await db("INSERT INTO inventory VALUES (1, 50, TO_DATE('14-SEP-2020', 'DD-MON-YYYY'), 'Excellent', 1, 1)"))
  result.push(await db("INSERT INTO equipment VALUES (2, 'Canon', 'EOS 5D Mark IV', 'DSLR')"))
  result.push(await db("INSERT INTO camera VALUES (2, 30, 2016, 'Full Frame', 'f/4.0')"))
  result.push(await db("INSERT INTO inventory VALUES (2, 35, TO_DATE('21-JUL-2017', 'DD-MON-YYYY'), 'Good', 1, 2)"))
  result.push(await db("INSERT INTO equipment VALUES (3, 'Canon', 'EOS Rebel T7i', 'DSLR')"))
  result.push(await db("INSERT INTO camera VALUES (3, 24, 2017, 'APS-C', 'f/3.5-5.6')"))
  result.push(await db("INSERT INTO inventory VALUES (3, 18, TO_DATE('05-MAR-2018', 'DD-MON-YYYY'), 'Fair', 1, 3)"))
  result.push(await db("INSERT INTO equipment VALUES (4, 'Nikon', 'D850', 'DSLR')"))
  result.push(await db("INSERT INTO camera VALUES (4, 36, 2017, 'Full Frame', 'f/2.8')"))
  result.push(await db("INSERT INTO inventory VALUES (4, 28, TO_DATE('10-MAY-2018', 'DD-MON-YYYY'), 'Excellent', 1, 4)"))
  result.push(await db("INSERT INTO equipment VALUES (5, 'Fujifilm', 'X-T4', 'Mirrorless')"))
  result.push(await db("INSERT INTO camera VALUES (5, 26, 2020, 'APS-C', 'f/2.8')"))
  result.push(await db("INSERT INTO inventory VALUES (5, 42, TO_DATE('02-JAN-2021', 'DD-MON-YYYY'), 'Good', 1, 5)"))
  result.push(await db("INSERT INTO equipment VALUES (6, 'Sony', 'Alpha 7R IV', 'Mirrorless')"))
  result.push(await db("INSERT INTO camera VALUES (6, 61, 2019, 'Full Frame', 'f/1.4')"))
  result.push(await db("INSERT INTO inventory VALUES (6, 15, TO_DATE('18-JUN-2020', 'DD-MON-YYYY'), 'Excellent', 1, 6)"))
  result.push(await db("INSERT INTO equipment VALUES (7, 'Panasonic', 'Lumix GH5', 'Mirrorless')"))
  result.push(await db("INSERT INTO camera VALUES (7, 20, 2017, 'M4/3', 'f/2.8')"))
  result.push(await db("INSERT INTO inventory VALUES (7, 22, TO_DATE('15-OCT-2017', 'DD-MON-YYYY'), 'Fair', 1, 7)"))
  result.push(await db("INSERT INTO equipment VALUES (8, 'Canon', 'High-performance flash', 'Speedlite 430EX')"))
  result.push(await db("INSERT INTO accessory VALUES (8, 14, 'Black', 'Flash')"))
  result.push(await db("INSERT INTO inventory VALUES (8, 20, TO_DATE('12-JUL-2015', 'DD-MON-YYYY'), 'Excellent', 1, 8)"))
  result.push(await db("INSERT INTO equipment VALUES (9, 'Nikon', 'Sharp lens', 'AF-S NIKKOR 50mm f/1.8G')"))
  result.push(await db("INSERT INTO accessory VALUES (9, 50, 'Black', 'Lens')"))
  result.push(await db("INSERT INTO inventory VALUES (9, 30, TO_DATE('05-MAR-2018', 'DD-MON-YYYY'), 'Good', 1, 9)"))
  result.push(await db("INSERT INTO equipment VALUES (10, 'Canon', 'Pro-grade zoom lens', 'EF 24-70mm f/2.8L II USM')"))
  result.push(await db("INSERT INTO accessory VALUES (10, 24, 'Black', 'Lens')"))
  result.push(await db("INSERT INTO inventory VALUES (10, 25, TO_DATE('20-NOV-2019', 'DD-MON-YYYY'), 'Fair', 1, 10)"))
  result.push(await db("INSERT INTO equipment VALUES (11, 'Sony', 'Rechargeable battery', 'NP-FZ100 Rechargeable Battery')"))
  result.push(await db("INSERT INTO accessory VALUES (11, 1, 'Black', 'Battery')"))
  result.push(await db("INSERT INTO inventory VALUES (11, 50, TO_DATE('22-AUG-2020', 'DD-MON-YYYY'), 'Excellent', 1, 11)"))
  result.push(await db("INSERT INTO equipment VALUES (12, 'Fujifilm', 'Zoom lens for Fujifilm X-series', 'XF 16-55mm f/2.8 R LM WR')"))
  result.push(await db("INSERT INTO accessory VALUES (12, 16, 'Black', 'Lens')"))
  result.push(await db("INSERT INTO inventory VALUES (12, 15, TO_DATE('30-DEC-2020', 'DD-MON-YYYY'), 'Good', 1, 12)"))
  result.push(await db("INSERT INTO equipment VALUES (13, 'Canon', 'Rechargeable battery', 'LP-E6N Rechargeable Battery')"))
  result.push(await db("INSERT INTO accessory VALUES (13, 1, 'Black', 'Battery')"))
  result.push(await db("INSERT INTO inventory VALUES (13, 40, TO_DATE('14-SEP-2019', 'DD-MON-YYYY'), 'Good', 1, 13)"))
  result.push(await db("INSERT INTO equipment VALUES (14, 'Manfrotto', 'Sturdy aluminum tripod', 'MT190XPRO3 Aluminum Tripod')"))
  result.push(await db("INSERT INTO accessory VALUES (14, 0, 'Blue', 'Tripod')"))
  result.push(await db("INSERT INTO inventory VALUES (14, 10, TO_DATE('05-JUN-2017', 'DD-MON-YYYY'), 'Fair', 1, 14)"))
  result.push(await db("INSERT INTO customer VALUES (1,'Sug', '511 England', '311','511 England','jphn@gmail.com')"))
  result.push(await db("INSERT INTO customer VALUES (2,'dog', '511 Italy', '11341','451 band','bohhn@gmail.com')"))
  result.push(await db("INSERT INTO customer VALUES (3,'cat', '21 arabia', '3451','11 Texas','Douggy@hotmail.com')"))
  result.push(await db("INSERT INTO customer VALUES (4,'Ibrahim', '14 muscles drive', '3518723999','14 muscles drive','douggy@hotmail.com')"))
  result.push(await db("INSERT INTO Rental VALUES (1, TO_DATE('2003-12-23', 'YYYY-MM-DD'), TO_DATE('2023-12-25', 'YYYY-MM-DD'), 1, 1, 0)"))
  result.push(await db("INSERT INTO Rental VALUES (2, TO_DATE('2003-01-22', 'YYYY-MM-DD'), TO_DATE('2024-06-02', 'YYYY-MM-DD'), 1, 1, 1)"))
  result.push(await db("INSERT INTO Rental VALUES (3, TO_DATE('2003-12-23', 'YYYY-MM-DD'), TO_DATE('2021-12-25', 'YYYY-MM-DD'), 1, 1, 0)"))
  result.push(await db("INSERT INTO Invoices VALUES (1, 1, TO_DATE('2023-10-05', 'YYYY-MM-DD'), 40.00, 1)"))
  result.push(await db("INSERT INTO Invoices VALUES (2, 0, TO_DATE('2021-02-03', 'YYYY-MM-DD'), 15.00, 1)"))
  result.push(await db("INSERT INTO Invoices VALUES (3, 1, TO_DATE('2009-01-02', 'YYYY-MM-DD'), 5.00, 2)"))
  result.push(await db("INSERT INTO Payment VALUES (2, TO_DATE('2023-09-30', 'YYYY-MM-DD'), 40.00, 1, 1)"))
  result.push(await db("INSERT INTO Payment VALUES (1, TO_DATE('2023-09-30', 'YYYY-MM-DD'), 120.00, 1, 2)"))
  result.push(await db("INSERT INTO Payment VALUES (3, TO_DATE('2023-10-05', 'YYYY-MM-DD'), 60.00, 2, 3)"))
  result.push(await db("INSERT INTO Payment VALUES (4, TO_DATE('2023-10-10', 'YYYY-MM-DD'), 75.00, 3, 2)"))
  result.push(await db("INSERT INTO Payment VALUES (5, TO_DATE('2023-10-12', 'YYYY-MM-DD'), 90.00, 2, 1)"))
  res.send(result)
})

/* Drop Tables 
    Drop all tables for the project
*/
app.get('/drop', async (req, res) => {
  const result = [];
  result.push(await db("DROP TABLE accessory CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE camera CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE customer CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE equipment CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE inventory CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE invoices CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE payment CASCADE CONSTRAINTS"))
  result.push(await db("DROP TABLE rental CASCADE CONSTRAINTS"))
  res.send(result)
});

/* Get Products
    Reads equipment table joined with given product type
*/
app.get('/equipment/:productType', async (req, res) => {
  var types = req.params.productType.split('&');
  var cmd = 'SELECT * FROM equipment';

  for (let i = 0; i < types.length; i++) {
    const type = types[i];
    if (type.toLowerCase() == 'camera' || type.toLowerCase() == 'accessory' || type.toLowerCase() == 'inventory') {
      cmd += ` LEFT JOIN ${type} ON equipment.equipmentid=${type}.equipmentid`;
    }

  }

  console.log(cmd);

  const result = await db(cmd)
  const updatedResult = transformData(result);
  res.send(updatedResult);
})

/* Index
    get index.html home page
*/
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html")
});

/* Admin
    get admin.html homepage
*/
app.get("/admin/", (req, res) => {
  res.sendFile(__dirname + "/js/admin.html")
});

/* Front-End Javascript 
    get front-end js files
*/
app.get("/js/:jsFileName", (req, res) => {
  dir = `/js/${req.params.jsFileName}`
  res.sendFile(__dirname + dir)
});


async function isValidEquipmentFormat(requiredFields, body, res, table) {
  const mutatedBody = Object.fromEntries(Object.entries(body).map(([key, value]) => [key.toUpperCase(), value]));
  for (const field of requiredFields) {
    const mutatedField = field.toUpperCase();
    if (!(mutatedField in mutatedBody)) {
      res.status(400).send('Invalid input: The request body does not match the required format.');
      return
    }
  }
  const columns = Object.keys(mutatedBody).join(', ');
  const values = Object.values(mutatedBody).map(value => typeof value === 'string' ? `'${value}'` : value).join(', ');
  const cmd = `INSERT INTO ${table} (${columns}) VALUES (${values})`;
  const result = await db(cmd)
  console.log(result)
  res.send(result)
}

/* Create Records */
app.post('/create/:tableID', async (req, res) => {
  console.log(req.params.tableID, req.body)
  const tableName = req.params.tableID
  /* Auto Increment ID */
  var nextID = 0
  if (! (tableName == 'camera' || tableName == 'accessory')){
    cmd = `select * from ${tableName}`
    const result = await db(cmd)
    nextID = Object.keys(result).length + 1;
  }
  else{
    cmd = `select * from equipment`
    const result = await db(cmd)
    nextID = Object.keys(result).length;
  }

    const newBody = req.body
  newBody[PK[tableName]] = nextID
  /* Insert Row */
  await isValidEquipmentFormat(columnNames[tableName], newBody, res, req.params.tableID)
})

/* Update Records */
app.post('/update/:tableID', async (req, res) => {
  console.log(req.params.tableID, req.body)
  // check if column valid for table
  if (!("id" in req.body)) {
    return res.status(400).send("Invalid input: Missing 'id'");
  }
  const tableName = req.params.tableID.toLowerCase()
  const mutatedObj = Object.fromEntries(
    Object.entries(req.body).filter(([key]) => key !== "id")
  );

  const formattedString = Object.entries(mutatedObj).map(([key, value]) => `${key}='${value}'`).join(', ');
  cmd = `UPDATE ${tableName} SET ${formattedString} WHERE ${PK[tableName]} = ${req.body.id}`
  console.log(cmd)
  const result = await db(cmd)
  res.send(result)
})

/* Delete Records */
app.post('/delete/:tableID', async (req, res) => {
  console.log(req.params.tableID, req.body.id)
  if (!("id" in req.body)) {
    console.log(req.body);
    return res.status(400).send("Invalid input: Missing 'id'");
  }
  const tableName = req.params.tableID.toLowerCase()
  cmd = `DELETE FROM ${tableName} WHERE ${PK[tableName]} = ${req.body.id}`
  console.log(cmd)

  const result = await db(cmd)
  res.send(result)
})

app.listen(port, () => {
  console.log(`Endpoint listening on port ${port}`)
})