import express from "express";
import path from "path"
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import mongoose from "mongoose";
import bodyParser from "body-parser";
import _ from "lodash";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const partialPath=path.join(__dirname,'../public');
console.log(partialPath)
const app=express();

const Port=process.env.PORT||5000;
app.use(bodyParser.urlencoded({ extended: true })); // Parse URL-encoded request bodies
app.set("view engine","ejs");


app.use(express.static(partialPath));

//MONGOOSE ,MONGODB CODE

mongoose.connect("mongodb+srv://admin:JayCr@cluster0.2ob4kzy.mongodb.net/todoListDB",{useNewUrlParser:true});

const itemsSchema={
  name:String
}

const Items=mongoose.model("Items",itemsSchema);

const item1=new Items({
  name:"summer"
});

const item2=new Items({
  name:"winter"
});

const defaultItems=[item1,item2];
const listSchema={
  name:String,
  items:[itemsSchema]
}

const List=mongoose.model("list",listSchema);


app.set("view engine","ejs");
// GETTING DAYS & MONTHS

const currentDate = new Date();

// Array of short daynames
const DayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Array of short month names
const MonthNames = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const currentDay = currentDate.getDay();
const currentMonth = currentDate.getMonth();

let lists=["hello","yellow"];





app.get("/:customListName", (req, res) => {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({ name: customListName })
    .then(foundList => {
      if (!foundList) {
        // CREATE A NEW LIST IF IT DOESN'T EXIST
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect(`/${customListName}`);
      } else {
        // SHOW AN EXISTING LIST
        res.render("index.ejs", { listTitle: foundList.name, lists: foundList.items });
      }
    })
    .catch(error => console.log("error"));
});

app.post("/", (req, res) => {
  const itemName = req.body.item;
  const listName = req.body.list;

  const newItem = new Items({
    name: itemName
  });

  newItem.save()
    .then(result => {
      console.log("success");

      if (listName === "Today") {
        res.redirect("/");
      } else {
        // Update the custom list's items
        List.findOne({ name: listName })
          .then(foundItem => {
            foundItem.items.push(newItem);
            foundItem.save(); // Save the custom list to update its items
            res.redirect("/" + listName);
          })
          .catch(error => {
            console.log("Error");
          });
      }
    })
    .catch(error => console.log("Error"));
});


app.get("/",(req,res)=>{
 
Items.find({})
.then(foundItems=>{
  if(foundItems.length===0){
     Items.insertMany(defaultItems, { ordered: false })
  .then((result) => {
    console.log("Success");
  })
  .catch((err) => {
    console.log("Error:", err);
  });
  } 
  res.render("index.ejs",{listTitle:"Today",lists:foundItems});
})
.catch(error=>{
console.log("error");
})

});

app.post("/delete",(req,res)=>{
  const id=req.body.checkBox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Items.findByIdAndRemove(id)
    .then(result=>console.log("successfuly deleted"))
    .catch(error=>console.log("error"));
    res.redirect("/");


  }else{
    List.findOneAndUpdate({name:listName}, {$pull:{items:{_id:id}}})
    .then(result=>{console.log("Successfull Deleted")})
    .catch(error=>{console.log("error")});
    res.redirect("/"+listName);
  }

  
})


app.listen(Port,()=>{
    console.log("listening to port 5000");
})