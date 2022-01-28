const express=require("express");
const bodyparser=require("body-parser");
const mongoose=require("mongoose");
const _=require('lodash');
var items=["Buy food","Cook food","Bring Pizza"];
let workItems=["Complete Recat Course","Product Development"]
const app=express();
app.set("view engine","ejs");
app.use(bodyparser.urlencoded({extended:true}))
app.use(express.static("public"))

mongoose.connect(
  "mongodb+srv://admin-swarn:Mytest-123@cluster0.zaqzk.mongodb.net/todoDB");

const itemsSchema={
  name:String
}
const Item=mongoose.model("Item",itemsSchema);
const item1=new Item({
  name:"Welcome to your todo"
})
const item2 = new Item({
  name: "Let's play holi",
});
const item3 = new Item({
  name: "Let's play cricket",
});

const defaultItems=[item1,item2,item3]
const listSchema=({
  name:String,
  items:[itemsSchema]
})
const List=mongoose.model("List",listSchema);


// Item.deleteMany({ ObjectId: "61ef0186afdd546489bfc96f" }, function (err) {
//   if (err) {
//     console.log(err);
//   } else {
//     console.log("Deleted");
//   }
// });
app.get("/",function(req,res){

    Item.find({},function(err,foundItems){
      if(foundItems.length===0){
        Item.insertMany(defaultItems,function(err){
          if(err){
            console.log(err)
          }else{
            console.log("Data saved successfully")
          }
        })
        res.redirect("/");
      }
      
      else{
        res.render("list", { listTitle: "Today", newListItem: foundItems });
      }
      
    })
    var today = new Date();
    var options={
      weekday:"long",
      day     :"numeric",
      month:"long"
    }; 

    var day = today.toLocaleDateString("en-US",options)
    
    
})


app.get("/:customListName",function(req,res){
  const customListName=_.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        //Create a new list
        const list=new List({
          name:customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/" + customListName)
        console.log("Doesn't exist")
      }else{
        //show an existing list
        res.render("list",{listTitle:foundList.name,newListItem:foundList.items}); 
        console.log("exist")
      }
    }
  })
})

app.post("/",function(req,res){
  const itemName = req.body.newitem;
  const listName=req.body.list; 
  const item=new Item({
    name:itemName
  })
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName)
    })
  }
  
  
})
app.post("/delete",function(req,res){
  const checkedId=req.body.checkbox;
  const listName=req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedId, function (err) {
      if (!err) {
        console.log("Succesfully deleted");
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedId}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName)
      }
    })
  } 
})

app.get("/work",function(req,res){
  res.render("list",{listTitle:"Work List",newListItem:workItems})
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port,function(){
    console.log("Server Started Successfully")
});

