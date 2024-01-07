const express = require("express");
const app = express();
const cors = require("cors");
const bodyParser = require("body-parser");
const escpos = require("escpos");
escpos.USB = require("escpos-usb");

//Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/api/ticket/printTicket", (req, res) => {

  const { items, total, createdByDisplayValue } = req.body;

  try {
    
    const device = new escpos.USB();
    const options = { encoding: "GB18030" };
    const execute = new escpos.Printer(device, options);

    device.open(function (err) {
      execute
        .font("a")
        .align("ct")
        .style("bu")
        .size(1, 1)
        .text("CASA ALVES")
        .size(0, 0)
        .feed(2)
        .marginLeft(0)
        .marginRight(0)
        .marginBottom(0)
        .tableCustom([
          { text: "Cant/Producto", align: "LEFT" },
          { text: "Precio", align: "LEFT" },
        ]);

      items.forEach((element) => {
         execute
         .drawLine()
         .tableCustom([
          { text: `${element.quantity}x ${element.name}`, align: "LEFT" },
          { text: `  \$${element.price}c/u`, align: "LEFT" },
        ]);
      });

      execute
        .drawLine()
        .tableCustom([{ text: `Total: \$${total}`, align: "CENTER" }])
        .feed(2)
        .tableCustom([{ text: `Vendedor: ${createdByDisplayValue}`, align: "LEFT" }])
        .feed(5)
        .close();

    });

    res.status(200).json({status: 200, message: "PRINTED_SUCCESSFULLY"});

  } catch (error) {

    console.log(error);
    res.status(500).json({status: 500, message: "PRINTER_MICROSERVICE_ERROR"});

  }
});

//Server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Listening on port ${PORT}`);
});
