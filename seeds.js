var mongoose = require("mongoose"),
    Campground = require("./models/campground"),
    Comment = require("./models/comment");

var data = [
        {
           name: "camp1",
            image: "https://images.unsplash.com/photo-1504851149312-7a075b496cc7?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=aaf08554d638e2690a4383bf1c632d93&auto=format&fit=crop&w=900&q=60",
            description: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old. Richard McClintock, a Latin professor at Hampden-Sydney College in Virginia, looked up one of the more obscure Latin words, consectetur, from a Lorem Ipsum passage, and going through the cites of the word in classical literature, discovered the undoubtable source. Lorem Ipsum comes from sections 1.10.32 and 1.10.33 of (The Extremes of Good and Evil) by Cicero, written in 45 BC. This book is a treatise on the theory of ethics, very popular during the Renaissance. The first line of Lorem Ipsum, comes from a line in section 1.10.32." 
        },
        {
           name: "camp2",
            image: "https://images.unsplash.com/photo-1496425745709-5f9297566b46?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=b084690f83c5e63fafd161f8bc729a1f&auto=format&fit=crop&w=900&q=60",
            description: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English. Many desktop publishing packages and web page editors now use Lorem Ipsum as their default model text, and a search for 'lorem ipsum' will uncover many web sites still in their infancy. Various versions have evolved over the years, sometimes by accident, sometimes on purpose (injected humour and the like)." 
        },
        {
           name: "camp3",
            image: "https://images.unsplash.com/photo-1487730116645-74489c95b41b?ixlib=rb-0.3.5&ixid=eyJhcHBfaWQiOjEyMDd9&s=aa6e65fcad07b9a68420c430034f84f2&auto=format&fit=crop&w=900&q=60",
            description: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form, by injected humour, or randomised words which don't look even slightly believable. If you are going to use a passage of Lorem Ipsum, you need to be sure there isn't anything embarrassing hidden in the middle of text. All the Lorem Ipsum generators on the Internet tend to repeat predefined chunks as necessary, making this the first true generator on the Internet. It uses a dictionary of over 200 Latin words, combined with a handful of model sentence structures, to generate Lorem Ipsum which looks reasonable. The generated Lorem Ipsum is therefore always free from repetition, injected humour, or non-characteristic words etc." 
        }
        
    ];
    
function seedDB(){
    // Remove all campgrounds
   Campground.remove({}, function(err){
        if(err){
            console.log(err);
        } else {
            console.log("removed campground");
            // // Add a few campgrounds
            // data.forEach(function(seed){
            //     Campground.create(seed, function(err, campground){
            //         if(err){
            //             console.log(err);
            //         } else {
            //             console.log("a campground added!");
            //             Comment.create({
            //                 text: "This place is awsome!",
            //                 author: "yukee"
            //             }, function(err, comment){
            //                 if(err){
            //                     console.log(err);
            //                 } else {
            //                     campground.comments.push(comment);
            //                     campground.save();
            //                     console.log("created a comment");
            //                 }
            //             })
            //         }
            //     });
            // });            
        }
    }); 
    // Add a few comments
}
module.exports = seedDB;
