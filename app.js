//Require needed modules in this To Do List web site
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const _ = require('lodash');

//connect to the local server
const urlConnection = "mongodb+srv://jeduardoleon22:y0UD17rw2KFKx0sU@todocluster.7qrabmy.mongodb.net/todolistDB"
main().catch(err => { console.log(err) });
async function main() {
    await mongoose.connect(urlConnection);
}

//initial configuration of express
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');


let items = []; //this array store the elements inside a specific collection of todolistDB
//configuration of Date object to show actual Date in view
const date = new Date();
const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };


const itemSchema = new mongoose.Schema({ //the schema for each item in any collection
    item: String
});

let listName = "";//stores the name of the actual listening collection
let reqParam = "";//stores the listName parammeter, wich call an specific collection (listName)

//default items to give basic instructions, only for the Main List (/index)
const defaultItem1 = {
    item: 'This is your to do list!'
};

const defaultItem2 = {
    item: 'Hit the + button to add items'
};

const defaultItem3 = {
    item: 'Check the box to remove an item'
};


app.listen(process.env.PORT || 3301, function () { console.log('Server Port 3301 On-Line') });

app.route('/listname/:listName')
    .get((req, res) => {
        let today = date.toLocaleDateString('en', options);
        reqParam = req.params.listName;
        if ((reqParam === 'index')) {
            listName = "Main List";
        }
        else {
            listName = `${_.capitalize(reqParam)} List`;
        }
        const Item = mongoose.model(listName, itemSchema);
        Item.find({})
            .then(docs => {
                if (docs.length == 0) {
                    if (listName === "Main List") {
                        Item.insertMany([defaultItem1, defaultItem2, defaultItem3])
                        /*.then(docs => {
                            console.log('Main list created');
                        })*/
                        .catch(error => {
                            if(error){
                                setTimeout(() => {
                                    console.log("Could not create the list...");
                                    console.log(error);
                                    res.redirect(`/listname/${reqParam}`);
                                }, 200);
                            }
                        })
                    }
                    else {
                        const voidList = new Item({
                            item: 'No items in this list'
                        });
                        voidList.save()
                        /*.then(docs => {
                            console.log('New list created');
                        })*/
                        .catch(error => {
                            if(error){
                                setTimeout(() => {
                                    console.log("Could not create the list...");
                                    console.log(error);
                                    res.redirect(`/listname/${reqParam}`);
                                }, 200);
                            }
                        })
                    }
                    setTimeout(() => {
                        res.redirect(`/listname/${reqParam}`);
                    }, 200);
                }
                else {
                    items = [];
                    for (let doc of docs) {
                        items.push(doc);
                    }
                    res.render('list', { today, listName, items, reqParam });
                }
            })
            .catch(error => {
                if(error){
                    setTimeout(() => {
                        res.redirect(`/listname/${reqParam}`);
                    }, 200);
                }
            });

    })
    .post((req, res) => {
        const Item = mongoose.model(listName, itemSchema);
        const newItem = new Item({
            item: req.body.newItem
        });
        newItem.save()
            /*.then(doc => {
                console.log("New item added");
            })*/
            .catch(error => {
                if(error){
                    setTimeout(() => {
                        res.redirect(`/listname/${reqParam}`);
                    }, 200);
                }
            });
        res.redirect(`/listname/${reqParam}`);
    });

app.get('/', (req, res) => {
    res.redirect('/listname/index')
});

app.route('/delete')
    .post((req, res) => {
        const itemToDelete = req.body.itemToDelete;
        listName = req.body.listName;
        //const redirectParam = _.toLower(_.trimEnd(listName, ' List'));
        const Item = mongoose.model(listName, itemSchema);
        Item.findByIdAndDelete({ _id: itemToDelete })
            /*.then(doc => {
                console.log("Item deleted");
            })*/
            .catch(error => {
                if(error){
                    setTimeout(() => {
                        console.log('Could not delete the item...');
                        console.log(error);
                        res.redirect(`/listname/${reqParam}`);
                    }, 200);
                }
            });
        res.redirect(`/listname/${reqParam}`);
    });