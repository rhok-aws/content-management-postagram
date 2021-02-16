// Working version

import React, { useState } from 'react';
import { jsx,css } from '@emotion/react';
import Button from './Button';
import { v4 as uuid } from 'uuid';
import { Storage, API, Auth, Amplify } from 'aws-amplify';
import { updatePost } from './graphql/mutations';
import { Link,Router } from 'react-router-dom'



// Date Picker
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
// import 'bootstrap/dist/css/bootstrap.min.css';

// // Getting data passed from Post

import {useLocation} from "react-router-dom";
import  {  useEffect } from 'react';

// Fixing input error


import Select from 'react-select';
console.log ('Start loading CreatePost.js')
Amplify.configure({
  Storage: {
      AWSS3: {
          bucket: 'pars-talent-development', //REQUIRED -  Amazon S3 bucket name
          region: 'us-east-2', //OPTIONAL -  Amazon service region
      }
  }
});



// Display value from post


// Display value from post



// Vertical values
const verticals = [
  { value: 'talent products', label: 'Talent Products' },
  { value: 'creative', label: 'Creative' },
  { value: 'ops and seller leadership', label: 'Ops and Seller Leadership' },
  { value: 'gso/gsa', label: 'GSO/GSA' },
  { value: 'cops', label: 'C-Ops' }
]

// Teams values
const teams = [
  { value: 'pars', label: 'PARS-TD' },
  { value: 'dg', label: 'Dangerous Goods' },
  { value: 'gso', label: 'GSO' }
]

/* Initial state to hold form input, saving state */
const initialState = {
  name: '',
  project: '',
  team: '',
  vertical: '',
  date: '',
  program: '',
  contentowner: '',
  tags: '',
  image: {},
  file: '',
  saving: false
};




export default function EditPost({
  updateOverlayVisibility, updatePosts, posts
}) {
  /* 1. Create local state with useState hook */
  const [formState, updateFormState] = useState(initialState)

  const [startDate, setStartDate] = useState(new Date());


  let location = useLocation();

  const [formData, setFormData] = useState({});

  useEffect(() => {
    setFormData(location.state)
    updateFormState(location.state)

    console.log('Data passing from Post', location.state)

  },[]);



  /* 2. onChangeText handler updates the form state when a user types into a form field */
 const onChangeText = (e) => {
    e.persist();
    console.log('Value of event',e)
    updateFormState(currentState => ({ ...currentState, [e.target.name]: e.target.value }));
  }
 

  /* 3. onChangeFile handler will be fired when a user uploads a file  */
  function onChangeFile(e) {
    e.persist();
    if (! e.target.files[0]) return;
    const image = { fileInfo: e.target.files[0], name: `${e.target.files[0].name}_${uuid()}`}
    updateFormState(currentState => ({ ...currentState, file: URL.createObjectURL(e.target.files[0]), image }))
  }


  // On select change
  
  function onSelectChangeTeam (e){
    updateFormState(currentState => ({ ...currentState, team: e.value}))

  }

  function onSelectChangeVertical(e) {
    console.log('select')
    updateFormState(currentState => ({ ...currentState, vertical: e.value}))

  }


  function onSelectDate(e) {
    console.log('select')
    updateFormState(currentState => ({ ...currentState, date: e.value}))


  
  }



  /* 4. Save the post  */
  async function save() {
    try {
      const { id,name, project, team, vertical, date, program, contentowner, owner, tags, image } = formState;
      // if (!name || !project || !team || !vertical || !date || !program || !owner || !tags || !image.name) return;
      updateFormState(currentState => ({ ...currentState, saving: true }));
      const postId = id
      // const postInfo = { name, project: "1", team: "1", vertical:"1", date:"1", program:"1", owner:"1", tags:"1", image: formState.image.name, id: postId };
      const postInfo = { name, project: formState.project, team: formState.team, vertical: formState.vertical, date: startDate, program: formState.program, contentowner: formState.contentowner, tags: formState.tags, image: formState.image.name, id: postId };

      // Debugging purpose 
      console.log("Value of Post Info", postInfo);

      console.log ('Image info', formState.image.name ,formState.image.fileInfo )
      
      if (formState.image.name && formState.image.fileInfo ){ await Storage.put(formState.image.name, formState.image.fileInfo); }
      await API.graphql({
        query: updatePost,
        variables: { input: postInfo },
        authMode: 'AMAZON_COGNITO_USER_POOLS'
      }); // updated
      const { username } = await Auth.currentAuthenticatedUser(); // new
      // updatePosts([...posts, { ...postInfo, image: formState.file, owner: username }]); // updated
      updateFormState(currentState => ({ ...currentState, saving: false }));

      alert('Saving post was successful!')
      // updateOverlayVisibility(false);
    } catch (err) {
      console.log('error: ', err);
      alert('Saving post was failed')
    }
  }


  return (

    <div className={containerStyle}>

      <h1>Post ID: {formData.id} </h1>
      <h1> Edit Post</h1>
      Name: 
      <input
        placeholder="File name"
        name="name"
        defaultValue =  {formData.name}
        onChange={onChangeText}

      />
      <hr/>
      Project:
      <input
        placeholder="Project Name"
        name="project"
        onChange={onChangeText}
        defaultValue =  {formData.project||""}
      />
       <hr/>
       Team:
      <Select
        placeholder="Team"
        name="team"
        options={teams}

        onChange={  onSelectChangeTeam}

        selectedValue =  {formData.teams||""}

        
      />
    <hr/>
       Vertical:
      <Select 
        placeholder="Vertical"
        name="vertical"
        options={verticals}

        onChange={ onSelectChangeVertical}

        selectedValue=  {formData.verticals||""}
      />
<hr/>
       Date:
<DatePicker selected={startDate} onChange={date => setStartDate(date)} />

<hr/>
       Program:
      <input
        placeholder="Program"
        name="program"
        onChange={onChangeText}
        defaultValue = {formData.program||""}
      />
      <hr/>
       Content onwer:
      <input
        placeholder="Content Owner"
        name="contentowner"
        onChange={onChangeText}
        defaultValue =  {formData.contentowner||""}
      />
      <hr/>
       Tags:
      <input
        placeholder="Tags"
        name="tags"
        onChange={onChangeText}

        defaultValue=  {formData.tags||""}

      />

      <h1>Current photo</h1>
      <hr/>
      <img alt="post" src={formData.image} className={imageStyle} />

      <input 
        type="file"
        onChange={onChangeFile}
      />
    
      {
       formState.file && <img className={imageStyle} alt="preview" src={formState.file} /> 
       
       }

      <hr/>

      <Button title="Save File" onClick={save} />

        ||

      <Button type="cancel" title="Cancel" onClick={() => updateOverlayVisibility(false)} />

      { formState.saving && <p className={savingMessageStyle}> Updating post...</p> }

       <hr/>
      <Link to={{
       pathname: '/',
      
    }} >
                <button > Back to home page  </button>
      </Link>

    </div>
  )


}//end of functional component

const inputStyle = css`
  margin-bottom: 10px;
  outline: none;
  padding: 7px;
  border: 1px solid #ddd;
  font-size: 16px;
  border-radius: 4px;
`

const imageStyle = css`
  height: 120px;
  margin: 10px 0px;
  object-fit: contain;
`

const containerStyle = css`
  display: flex;
  flex-direction: column;
  width: 400px;
  height: 420px;
  position: fixed;
  left: 0;
  border-radius: 4px;
  top: 0; 
  margin-left: calc(50vw - 220px);
  margin-top: calc(50vh - 230px);
  background-color: white;
  border: 1px solid #ddd;
  box-shadow: rgba(0, 0, 0, 0.25) 0px 0.125rem 0.25rem;
  padding: 20px;
`

const savingMessageStyle = css`
  margin-bottom: 0px;
`