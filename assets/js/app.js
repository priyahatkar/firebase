
const cl = console.log;

const formPost = document.getElementById("formPost");
const titleControl = document.getElementById("title");
const contentControl = document.getElementById("content");
const postContainer = document.getElementById("postContainer");
const updateBtn = document.getElementById("updateBtn")
const submitBtn = document.getElementById("submitBtn")
const cancelBtn = document.getElementById("cancelBtn")


const baseUrl = `https://firbase-xhr-default-rtdb.asia-southeast1.firebasedatabase.app/`

const postUrl = `${baseUrl}/post.json`;
// cl(postUrl)
let postArray =[];

const templating =(arr) =>{
    let result = "";

    arr.forEach((str)=>{
        result += `
                    <div class="card mt-5" id="${str.id}">
                        <div class="card-header">
                            <h4>${str.title}</h4>
                        </div>
                        <div class="card-body">
                            <p>${str.content}</p>
                        </div>
                        <div class="card-footer">
                            <button type="button" class="btn btn-primary" onclick="onEdit(this)">Edit</button>
                            <button type="button" class="btn btn-danger" onclick="onDelete(this)">Delete</button>
                        </div>
                    </div>
                `
    })
        postContainer.innerHTML=result;

}

const makeApiCall =(method,apiUrl,body)=>{
    return new Promise ((resolve, reject) => {
        let xhr = new XMLHttpRequest()

        xhr.open(method,apiUrl)

        xhr.onload = function(){
            if(xhr.status >= 200 ||xhr.status <= 300){
                resolve(xhr.response)
            }else{
                reject('something went wrong')
            }
        }
        xhr.send(JSON.stringify(body))
    })
}

makeApiCall("GET",postUrl)
    .then((res)=>{
        // cl(res)
        let data = JSON.parse(res)
        for(let k in data){
            let obj = {
                id : k,
                ...data[k]
            }
            postArray.push(obj)
        }
        templating(postArray)
    })
    .catch(cl)


    formPost.addEventListener("submit",(eve)=>{
        eve.preventDefault();
        // cl("clicked")
        let obj ={
            title : titleControl.value,
            content : contentControl.value
        }
        makeApiCall("POST", postUrl, obj)
        .then((res)=>{
            Swal.fire({
                position: 'center',
                icon: 'success',
                title: 'Your post created successfully',
                showConfirmButton: false,
                timer: 1500
            })
            let dataPost = JSON.parse(res)
            let card = document.createElement("div")
            cl(card)
            card.id = dataPost.name
            card.className="card mt-5";
            let result = `
                <div class="card-header">
                    <h4>${obj.title}</h4>
                </div>
                <div class="card-body">
                    <p>${obj.content}</p>
                </div>
                <div class="card-footer">
                    <button type="button" class="btn btn-primary">Edit</button>
                    <button type="button" class="btn btn-danger">Delete</button>
                </div>
                `
                card.innerHTML=result;
                postContainer.append(card)
                formPost.reset()
        })
        .catch(cl)
    })

const onEdit =(ele)=>{
    let editId = ele.closest(".card").id;
    localStorage.setItem('editId',editId)
    let editUrl = `${baseUrl}/post/${editId}.json`


    makeApiCall("GET", editUrl)
        .then((res)=>{
            let editData = JSON.parse(res)
                
            titleControl.value = editData.title;
            contentControl.value = editData.content;
        })
        .catch(cl)
        .finally(()=>{
            updateBtn.classList.remove('d-none')
            submitBtn.classList.add('d-none')
        })
}

const onDelete = (ele) =>{
    let deleteId = ele.closest(".card").id;
    // cl(deleteId)
    let deleteUrl = `${baseUrl}/post/${deleteId}.json`
    
    Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
    }).then((result) => {
        if (result.isConfirmed) {
            makeApiCall("DELETE" ,deleteUrl)
            .then((res)=>{
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Your post has been Deleted',
                    showConfirmButton: false,
                    timer: 1500
                })
                let deleteId1 =document.getElementById(deleteId)
                deleteId1.remove()
                
            })
            .catch(cl)
        }else{
            return
        }
    })

}

    updateBtn.addEventListener("click",(eve)=>{
        let updateId = localStorage.getItem("editId")
        // cl(updateId)

        let updateUrl =`${baseUrl}/post/${updateId}.json`
        // cl(updateUrl)

        let obj ={
            title : titleControl.value,
            content : contentControl.value
        }

        makeApiCall("PATCH", updateUrl , obj)
            .then((res)=>{
                Swal.fire({
                    position: 'center',
                    icon: 'success',
                    title: 'Your post successfully updated',
                    showConfirmButton: false,
                    timer: 1500
                })
                let card = [...document.getElementById(updateId).children];
                card[0].innerHTML = ` <h4>${obj.title}</h4>`
                card[1].innerHTML =`<p>${obj.content}</p>`
            })
            .catch(cl)
            .finally(()=>{
                updateBtn.classList.add('d-none')
                submitBtn.classList.remove('d-none')
                formPost.reset()
            })
    })

    cancelBtn.addEventListener("click", (eve)=>{
        // cl(eve)
        formPost.reset()
        updateBtn.classList.add('d-none')
        submitBtn.classList.remove('d-none')
    })