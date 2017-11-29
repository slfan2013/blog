$(function(){

/*var aaa = 1;
if(localStorage.getItem('username') !== null){
      $("#username").text(localStorage.getItem('username'))
}else{
  window.location.href = 'login.html';
}*/


if(localStorage.getItem('project_id_global') === null){
  $("#selected_project_text").hide()
}else{
  $("#selected_project_text").show()
  $("#selected_project_name").text(localStorage.getItem('project_id_global').split("_68410298_")[0])
}



$("#toggle_settings").click(function(){
    $( "#parameter_settings" ).toggle("fold");
})


  add_selection_option_according_to_sample_info = function(id1, id2, id2_num_option, id1_selected = null){
              var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
      db.get(localStorage.getItem("project_id_global"), {attachments: true}).then(function(doc){
        $(id1)
            .find('option')
            .remove()
            .end()
        $.each(doc.sample_info_column_name, function (i, item) {

            $(id1).append($('<option>', {
              value: item,
              text : item
            }));

        });

        if(id1_selected !== null){
          $(id1).val(id1_selected)
        }


        if(id2 !== null){
          var levelsOptions = [];
                  for(var i=0; i<doc.sample_info[$(id1).val()].length; i++){
                    levelsOptions.push({
                      text:doc.sample_info[$(id1).val()][i],
                      value:doc.sample_info[$(id1).val()][i]
                    })
                  };
              $(id2).replaceOptions(levelsOptions);
              $(id2).chosen();
              $(id2).val(doc.sample_info[$(id1).val()].slice(0,id2_num_option));
              $(id2).trigger('chosen:updated');
            $(id1).change(function(){
            var levelsOptions = [];
              for(var i=0; i<doc.sample_info[$(id1).val()].length; i++){
                levelsOptions.push({
                  text:doc.sample_info[$(id1).val()][i],
                  value:doc.sample_info[$(id1).val()][i]
                })
              };
            $(id2).replaceOptions(levelsOptions);
            $(id2).chosen();
            $(id2).val(doc.sample_info[$(id1).val()].slice(0,id2_num_option));
            $(id2).trigger('chosen:updated');
            })

        }
      })
  }

  file_to_jsonable_object = function(myFile){
    return {
       'lastModified'     : myFile.lastModified,
       'lastModifiedDate' : myFile.lastModifiedDate,
       'name'             : myFile.name,
       'size'             : myFile.size,
       'type'             : myFile.type,
       'webkitRelativePath': myFile.webkitRelativePath
    };
  }



  makeTableHTML = function(myArray) {

			var headers_index = 0;
			var temp_max = 0;
			for(var i=0; i<myArray.length; i++){
			  if(Object.keys(myArray[i]).length>temp_max){
			    temp_max = Object.keys(myArray[i]).length
			    headers_index = i
			  }
			}
			var headers = Object.keys(myArray[headers_index])

			var result = "<table class='table table-hover'><thead>";
			// headers
			for(var h=0; h<headers.length;h++){
				result = result + "<th>"+ headers[h] + "</th>";
			}
			result = result+"</thead><tbody>"

			for(var i=0; i<myArray.length; i++) {
				result += "<tr>";
  			for(var j=0; j<headers.length; j++){
  			  if(j==0){
  			   result +=  "<td>"+myArray[i][headers[j]]+"</td>";
  			  }else{
  			    result += "<td>"+myArray[i][headers[j]]+"</td>";
  			  }
  			}
				result += "</tr>";
			}
			result += "</tbody></table>";
      return result;
      }







load_tree = function(project_id){ // remove previous tree and build a new tree by project_id.
      var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
      $('#jstree').jstree('destroy');

      db.get(project_id).then(function(doc){
                                $('#jstree').jstree({
                                      'core' : {
                                        'data' : doc.tree_structure,
                                            'check_callback' : function (operation, node, node_parent, node_position, more) {
                                            // operation can be 'create_node', 'rename_node', 'delete_node', 'move_node', 'copy_node' or 'edit'
                                            // in case of 'rename_node' node_position is filled with the new node name
                                            return operation === 'rename_node' ? true : false;
                                        },
                                        'multiple':false, // cannot select multiple nodes.
                                        'expand_selected_onload':true,
                                         "check_callback" : true
                                     },
                                    "contextmenu":{ // content when user right click a node.
                                      "show_at_node":false, // the menu follows the mouse.
                                      "items":function($node) {

                                        clicked_node = $node

                                        var createable = true;
                                        var renameable = true;
                                        var removeable = true;
                                        var uploadable = false;
                                        var updateable = true;
                                        var downloadable = true;
                                        var loadable = false;
                                        if($node.parent == '#'){
                                          renameable = false;
                                          removeable = false;
                                        }
                                        if($node.icon == "fa fa-folder"){
                                            uploadable = true;
                                            updateable = false;
                                        }
                                        if($node.icon == "fa fa-file-powerpoint-o"){
                                            updateable = false;
                                        }
                                        if($node.icon !== "fa fa-file-powerpoint-o" && $node.icon !== "fa fa-folder" && $node.text.indexOf(".xlsx") !== -1){
                                          updateable = false;
                                        }
                                        if($node.text === "sample_info.csv" && $node.parent === "root" || $node.text === "metabolite_info.csv"){
                                          renameable = false;
                                          removeable = false;
                                        }





                                        var tree = $("#jstree").jstree(true);
                                        var items = {
                                            "Create": {
                                                "label": "Create Folder",
                                                "icon":"fa fa-plus-square-o",
                                                "_disabled":!createable,
                                                "action": function (obj) {
                                                  $node = tree.create_node($node);
                                                  tree.edit($node, null, function(node){// check if the node's new name has been taken. If so, delete this node. Otherwise, create a new node, with id 'newname'+Data().
                                                    db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
                                                    db.get(project_id).then(function(doc){
                                                      var nd = node;
                                                      var sibling_id = tree.get_node(nd.parent).children
                                                      var sibling_name = [];
                                                      for(var i=0;i<sibling_id.length;i++){
                                                        sibling_name.push(sibling_id[i].split("_68410298_")[0])
                                                      }
                                                      if(sibling_name.indexOf(nd.text) > -1){
                                                        tree.delete_node(node);
                                                        alert("The name, '"+nd.text+"' has been taken.")
                                                      }else{
                                                        var d = new Date();
                                                        var num_date = d.getTime();
                                                        doc.tree_structure.push({
                                                          "id":nd.text+"_68410298_"+num_date,
                                                          "parent":nd.parent,"text":nd.text,
                                                          "icon":"fa fa-folder"
                                                        })
                                                        // reload the tree.
                                                        var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');db.put(doc).then(function(){load_tree(project_id);});
                                                      }
                                                    }).catch(function (error) {
                                                          console.log(error)
                                                      });
                                                  });

                                                }
                                            },
                                            "Rename": {
                                                "label": "Rename",
                                                "icon":"fa fa-edit",
                                                "_disabled": !renameable,
                                                "action": function (obj) {

                                                  tree.edit($node, null, function(node){
                                                    var old_node = $node

                                                    db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
                                                    db.get(project_id).then(function(doc){
                                                      var nd = node;
                                                      var sibling_id = tree.get_node(nd.parent).children
                                                      var sibling_name = [];
                                                      for(var i=0;i<sibling_id.length;i++){
                                                        sibling_name.push(sibling_id[i].split("_68410298_")[0])
                                                      }
                                                      if(sibling_name.indexOf(nd.text) > -1){
                                                        alert(nd.text + " is taken!")
                                                        $('#jstree').jstree(true).rename_node($('#jstree').jstree('get_selected'), old_node.id.split("_68410298_")[0]);
                                                      }else{

                                                        // change ID of old node.
                                                        // change parent of old node children.
                                                        var d = new Date();
                                                        var num_date = d.getTime();
                                                        var new_id = nd.text+"_68410298_"+num_date
                                                        // delett the old node.
                                                        for(var i=0;i<doc.tree_structure.length;i++){
                                                          if(doc.tree_structure[i].id === old_node.id && doc.tree_structure[i].parent === old_node.parent){
                                                            var old_tree_info = doc.tree_structure[i]
                                                            doc.tree_structure.splice(i,1); break
                                                          }
                                                        }
                                                        // add siblings with new id.
                                                        for(var i=0;i<doc.tree_structure.length;i++){
                                                          if(doc.tree_structure[i].parent === old_node.id){
                                                            doc.tree_structure[i].parent = new_id
                                                          }
                                                        }
                                                        // new id as parent.
                                                        doc.tree_structure.push({
                                                          "id":new_id,
                                                          "parent":nd.parent,
                                                          "text":nd.text,
                                                          "icon":old_tree_info.icon,
                                                          "source":old_tree_info.source,
                                                          "attname":old_tree_info.attname,
                                                          "column_name":old_tree_info.column_name,
                                                          "column_length":old_tree_info.column_length,
                                                          "column_class":old_tree_info.column_class,
                                                          "column_value":old_tree_info.column_value,
                                                        })
                                                        var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');db.put(doc).then(function(){load_tree(project_id);});
                                                      }
                                                    }).catch(function (error) {
                                                          console.log(error)
                                                      });
                                                  });
                                                }
                                            },
                                            "Remove": {
                                                "label": "Remove",
                                                "icon":"fa fa-trash-o",
                                                "_disabled":!removeable,
                                                "action": function (obj) { //
                                                  var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
                                                    $('#delete_node_modal').modal('show');
                                                    // confirm_delete_node
                                                }
                                            },
                                            "Upload": {
                                              "label": "Upload new file",
                                               "icon":"fa fa-upload",
                                              "_disabled":!uploadable,
                                              "action":function(obj){

                                                db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
                                                db.get(project_id).then(function(doc){
                                                  var nd = $node;
                                                      var children_id = tree.get_node(nd.id).children
                                                      var children_name = [];
                                                      var temp;
                                                      for(var i=0;i<children_id.length;i++){
                                                        temp = children_id[i].split("_68410298_")[0]
                                                        children_name.push(temp.replace('_csv',".csv"))
                                                      }
                                                      return(children_name)
                                                }).then(function(children){

                                                swal({
                                                  width:'400px',
                                                  title: 'Select a csv file',
                                                  text:"please click following button to upload a .csv data.",
                                                  input: 'file',
                                                  inputAttributes: {
                                                    'accept': '.csv'
                                                  }
                                                }).then(function (file) {
                                                  swal({
                                                    width:'400px',
                                                    title: 'Enter a file name',
                                                    input: "text",
                                                    inputValue:file.name,
                                                    inputValidator:function(value){
                                                      return new Promise(function(resolve, reject){
                                                        if(value==undefined){
                                                          reject('Please enter a name')
                                                        }else if(value.substring(value.length-4,value.length)!=='.csv'){
                                                          reject('You have to name your file ending with ".csv".')
                                                        }else if(children.indexOf(value.slice(0,-4))>-1){
                                                          reject('The filename '+value+' is taken!')
                                                        }else{
                                                          resolve()
                                                        }
                                                      })
                                                    }
                                                  }).then(function (name) {

                                                    var req = ocpu.call("get_upload_file_info",{
                                                      input : file
                                                    }, function(session){
                                                      session.getObject(function(oo){
                                                          name = name.slice(0,-4)

                                                          db.get(project_id, {attachments: true}).then(function(doc){
                                                            var d = new Date();
                                                            var num_date = d.getTime();
                                                             doc['_attachments'][name+"_68410298_"+num_date+".csv"] = {
                                                              content_type:file.fype,
                                                              "data": file
                                                            }
                                                            doc.tree_structure.push({
                                                              "id":name+"_68410298_"+num_date+"_csv","parent":$node.id,"text":name+".csv",icon:"fa fa-file-excel-o",attname:name+"_68410298_"+num_date+".csv",source:{FUNCTION:"UPLOAD_68410298_",PARAMETER:{"input":file_to_jsonable_object(file)}},column_name:oo.column_name, column_value:oo.column_value, column_length:oo.column_length, column_class:oo.column_class
                                                            })
                                                             return doc;
                                                          }).then(function(doc){
                                                            db.put(doc).then(function(){
                                                                load_tree(project_id);
                                                              });
                                                             swal({
                                                                type: 'success',
                                                                title: 'uploaded new file: ' + name
                                                              });
                                                          }).catch(function (err) {
                                                              console.log(err);
                                                            });

                                                      })
                                                    })
                                                  })


                                                })
                                                })



                                              }
                                            },
                                            "Edit":{
                                               "label": "Edit",
                                               "icon":"fa fa-edit",
                                              "_disabled":!updateable,
                                              "action":function(obj){

                                                    window.open("http://slfan:Fansly68410298_@localhost:5984/abib/"+project_id+"/"+$node.id.replace("_csv",".csv"))
                                                $('#edit_file_input').val("")
                                                $('#edit_file_modal').modal('show');
                                                //preview_edit_file_button
                                                //confirm_edit_file_node
                                              }
                                            },
                                            "Download":{
                                               "label": "Download",
                                               "icon":"fa fa-download",
                                              "_disabled":!downloadable,
                                              "action":function(obj){

                                                // download the file.
                                                if($node.id.indexOf("_csv") !== -1){
                                                  window.open("http://slfan:Fansly68410298_@localhost:5984/abib/"+project_id+"/"+$node.id.replace("_csv",".csv"))
                                                }else if($node.id.indexOf("_xlsx") !== -1){
                                                  window.open("http://slfan:Fansly68410298_@localhost:5984/abib/"+project_id+"/"+$node.id.replace("_xlsx",".xlsx"))
                                                }else if($node.id.indexOf("_pptx") !== -1){
                                                  window.open("http://slfan:Fansly68410298_@localhost:5984/abib/"+project_id+"/"+$node.id.replace("_pptx",".pptx"))
                                                }else if($node.id.indexOf("_png") !== -1){
                                                  window.open("http://slfan:Fansly68410298_@localhost:5984/abib/"+project_id+"/"+$node.id.replace("_png",".png"))
                                                }else if($node.id.indexOf("_html") !== -1){
                                                  window.open("http://slfan:Fansly68410298_@localhost:5984/abib/"+project_id+"/"+$node.id.replace("_html",".html"))
                                                }else{ // this means that the node is a folder.
                                                var tree = $('#jstree').jstree(true);
                                                var selected_node_id = clicked_node.id;
                                                var unincluded_folder = [];
                                                var included_path = [];
                                                var included_id = [];
                                                included_path[0] = tree.get_path(tree.get_node(selected_node_id).id,"/")
                                                included_id[0] = selected_node_id
                                                unincluded_folder[0] = tree.get_node(selected_node_id).id;
                                                while(unincluded_folder.length > 0){
                                                  var update_unincluded_folder = [];
                                                  for(var i=0;i<unincluded_folder.length;i++){
                                                    //var children = tree.get_children_dom(tree.get_node(unincluded_folder[i]))
                                                    var children = tree.get_node(unincluded_folder[i]).children
                                                    for(var j=0;j<children.length;j++){
                                                      var child_node = tree.get_node(children[j])
                                                      if(tree.is_leaf(child_node,"/")){
                                                        included_id.push(child_node.id)
                                                        included_path.push(tree.get_path(child_node,"/"))
                                                      }else{
                                                        included_id.push(child_node.id)
                                                        included_path.push(tree.get_path(child_node,"/"))
                                                        update_unincluded_folder.push(child_node.id)
                                                      }
                                                    }
                                                  }
                                                  unincluded_folder = update_unincluded_folder
                                                }

                                                iii = included_id
                                                ppp = included_path

                                                var req = ocpu.call("download_folder_as_zip",{
                                                  project_id:localStorage.getItem("project_id_global"),
                                                  id:included_id,
                                                  path:included_path
                                                }, function(session){
                                                  session.getObject(function(oo){
                                                      window.open(session.loc + "files/" + oo[0])
                                                  })
                                                })







                                                }


                                              }
                                            }
                                            /*,"Load":{
                                               "label": "Load result",
                                               "icon":"fa fa-edit",
                                              "_disabled":!loadable,
                                              "action":function(obj){
                                                split(" | ")[1]
                                              }
                                            }*/
                                        };
                                        return items;
                                    }
                                    },
                                     "plugins" : [  "contextmenu",  "state"]

                                     })
      }).catch(function (err) {
        console.log(err);
      });
    }



    $("#get_project_list").click(function(){
      $("#project_list ol").empty();
      var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
      db.allDocs({include_docs: false}).then(function(response){
        for(var i=0;i<response.rows.length;i++){
          $("#project_list ol").append('<li>'+response.rows[i].id+'</li>');
        }
      })
    })

$("#confirm_delete_node").click(function(){
  var selected_node_id = $("#jstree").jstree("get_selected")
  var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
  db.get(localStorage.getItem("project_id_global"), {attachments: true}).then(function(doc){


    var remove_index = [];
    var bad_id = [];
    bad_id.push(selected_node_id[0])
    var saved_index; // see bad_id.splice(bad_id.indexOf(doc.tree_structure[i].id),1)
      for(var i=0;i<doc.tree_structure.length;i++){

      if(bad_id.indexOf(doc.tree_structure[i].id) > -1){// is the node is a bad id, remove this node.
        remove_index.push(i)
        saved_index = doc.tree_structure[i].id
      }
      if(bad_id.indexOf(doc.tree_structure[i].parent)>-1){
        remove_index.push(i)
        bad_id.push(doc.tree_structure[i].id)
      }
    }


    for(var i = remove_index.length -1;i>-1;i--){

      if(doc.tree_structure[remove_index[i]].attname !== undefined){ // delete attachment as well
        delete doc._attachments[[doc.tree_structure[remove_index[i]].attname]]
      }
      doc.tree_structure.splice(remove_index[i],1)
    }






    db.put(doc).then(function(){$('#delete_node_modal').modal('hide'); load_tree(localStorage.getItem("project_id_global")); });
  })
})


$("#preview_edit_file_button").click(function(){
  var req = ocpu.call("preview_edit_file",{
          input:$('#edit_file_input').val()
        },function(session){
           session.getObject(function(obj){
             localStorage.setItem('preview_edit_table_input', JSON.stringify(obj));
             window.open("other_html_preview_edit_table.html");
           })
        })
})
$("#confirm_edit_file_node").click(function(){// check edit file format and submit to couchdb
  var req = ocpu.call("confirm_edit_file_node",{

    input:$('#edit_file_input').val(),
    project_ID:localStorage.getItem("project_id_global"),
    node_id:clicked_node.id
  },function(session){
    $('#edit_file_modal').modal('hide');
    alert("Success!")
  })
})


// INFORMATION
var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
      db.get(localStorage.getItem("project_id_global"), {attachments: true}).then(function(doc){

        dd = doc


      $("#project_description").html(doc.project_description)
      if(doc.experimental_factor !== undefined){
        $("#experimental_factor").html(doc.experimental_factor.join(", "))
      }


        $('#experimental_factor_option')
            .find('option')
            .remove()
            .end()
        $.each(doc.sample_info_column_name, function (i, item) {
          $('#experimental_factor_option').append($('<option>', {
              value: item,
              text : item
          }));

        });

})


$("#project_description").click(function(){
  $("#project_description_modal").modal('show');
  db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
  db.get(localStorage.getItem("project_id_global")).then(function(obj){
    $("#edit_project_description").val(obj.project_description)
  })
})
$("#project_description_edit_confirm").click(function(){
   db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
   db.get(localStorage.getItem("project_id_global")).then(function(obj){
    obj.project_description = $("#edit_project_description").val()
    return(obj)
  }).then(function(obj){
    db.put(obj)
    $("#project_description").html(obj.project_description)
  })
  $("#project_description_modal").modal('hide');
})







$("#experimental_factor").click(function(){
  $("#experimental_factor_modal").modal('show');
  $('#experimental_factor_option').chosen();
  var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
  db.get(localStorage.getItem("project_id_global")).then(function(doc){
    if(doc.experimental_factor !== undefined){
      $("#experimental_factor_option").val(doc.experimental_factor);
    }
    $('#experimental_factor_option').trigger('chosen:updated');
  })
})
$("#experimental_factor_edit_confirm").click(function(){
   var db = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib');
   db.get(localStorage.getItem("project_id_global")).then(function(doc){
    doc.experimental_factor = $("#experimental_factor_option").val()
    return(doc)
  }).then(function(doc){
    db.put(doc)
    $("#experimental_factor").html(doc.experimental_factor.join(", "))
  })
  $("#experimental_factor_modal").modal('hide');
})


// REPORT BUG
$("#submit_bug").click(function(){

  var db_bug = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib_bug');
  var d = new Date()
  var new_bug = {
    "_id": localStorage.getItem("project_id_global") + d.getTime(),
    "project_ID":localStorage.getItem("project_id_global"),
    "username":localStorage.getItem("username"),
    "submit_time":Date(),
    "name": this.name,
    "message":$("#report_bug_text").val()
  }

  db_bug.put(new_bug).then(function(){
     swal({type: 'success',title: 'Message recieved!'})
  }).catch(function (error) {console.log(error)});

})


// format error message
format_error_message = function(error){
  return error.split("\r\n\r\nIn call:")[0];
}

// add views + 1 when click tutorial_button
$("#tutorial_button").click(function(){
  var db_tutorial = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib_tutorial');
      db_tutorial.get(this.name, {attachments: false}).then(function(doc){

        doc.num_views = doc.num_views + 1

        db_tutorial.put(doc)
        $("#num_views").text(doc.num_views)



      })
})

// Avoid dropdown menu close on click inside.  https://stackoverflow.com/questions/25089297/avoid-dropdown-menu-close-on-click-inside
$('#topright_alert').on('click', function (event) {
    $(this).parent().toggleClass('open');
});
$('body').on('click', function (e) {
    if (!$('#topright_alert_parent').is(e.target)
        && $('#topright_alert_parent').has(e.target).length === 0
        && $('.open').has(e.target).length === 0
    ) {
        $('#topright_alert_parent').removeClass('open');
    }
});
// initialize auto_save parameter. Default is false.
var db_user_info = new PouchDB('http://slfan:Fansly68410298_@localhost:5984/abib_user_info');
db_user_info.get(localStorage.getItem("username")).then(function(doc){
  if(doc.auto_save === undefined){
    $('#auto_save').prop("checked",false);
  }else{
    $('#auto_save').prop("checked",doc.auto_save);
  }
})

// when auto_save is clicked, save the parameter to abib_user_info
$("#auto_save").click(function(){
  $("#auto_save").prop("disabled", true)
  db_user_info.get(localStorage.getItem("username")).then(function(doc){
    doc.auto_save = $("#auto_save").is(':checked')
    db_user_info.put(doc).then(function(){
      $("#auto_save").prop("disabled", false)
    })
  })
})



load_tree(localStorage.getItem("project_id_global"));

  })
