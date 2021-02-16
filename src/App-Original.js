import React, { useState, useEffect } from "react";
import {
  HashRouter,
  Switch,
  Route
} from "react-router-dom";

import { css } from '@emotion/react';
import { API, Storage, Auth } from 'aws-amplify';
import { listPosts } from './graphql/queries';
import { withAuthenticator, AmplifySignOut } from '@aws-amplify/ui-react';

import Posts from './Posts';
import Post from './Post';
import Header from './Header';
import CreatePost from './CreatePost';
import Button from './Button';

// Date Picker
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import 'bootstrap/dist/css/bootstrap.min.css';

function Router() {
  /* create a couple of pieces of initial state */
  const [showOverlay, updateOverlayVisibility] = useState(false);
  const [myPosts, updateMyPosts] = useState([]);

  /* fetch posts when component loads */
  useEffect(() => {
      fetchPosts();
  }, []);
  async function fetchPosts() {
    /* query the API, ask for 100 items */
    let postData = await API.graphql({ query: listPosts, variables: { limit: 100 }});
    let postsArray = postData.data.listPosts.items;
    /* map over the image keys in the posts array, get signed image URLs for each image */
    postsArray = await Promise.all(postsArray.map(async post => {
      const imageKey = await Storage.get(post.image);
      post.image = imageKey;
      return post;
    }));
    /* update the posts array in the local state */
    setPostState(postsArray);
  }

  async function setPostState(postsArray) {
    const user = await Auth.currentAuthenticatedUser();
    const myPostData = postsArray.filter(p => p.owner === user.username);
    console.log('postsArray:' , postsArray)
    updateMyPosts(myPostData);
}

  return (
    <>
      <HashRouter>
          <div className={contentStyle}>
          <AmplifySignOut />
            <Header />
            <hr className={dividerStyle} />
            <Button title="Upload" onClick={() => updateOverlayVisibility(true)} />
            { showOverlay && (
              <CreatePost
                updateOverlayVisibility={updateOverlayVisibility}
                updatePosts={setPostState}
                posts={myPosts}
              />
            )}
            <Switch>
              <Route exact path="/myposts" >
                <Posts posts={myPosts} />
              </Route>
              <Route path="/post/:id" >
                <Post />
              </Route>
            </Switch>
          </div>
        </HashRouter>
    </>
  );
}


// class App extends Component {

//   constructor (props) {
//     super(props)
//     this.state = {
//       startDate: new Date()
//     };
//     this.handleChange = this.handleChange.bind(this);
//     this.onFormSubmit = this.onFormSubmit.bind(this);
//   }

//   handleChange(date) {
//     this.setState({
//       startDate: date
//     })
//   }

//   onFormSubmit(e) {
//     e.preventDefault();
//     console.log(this.state.startDate)
//   }
 
//   render() {
//     return (
//       <form onSubmit={ this.onFormSubmit }>
//         <div className="form-group">
//           <DatePicker
//               selected={ this.state.startDate }
//               onChange={ this.handleChange }
//               name="startDate"
//               dateFormat="MM/dd/yyyy"
//           />
//           <button className="btn btn-primary">Show Date</button>
//         </div>
//       </form>
//     );
//   }
  
// }

const dividerStyle = css`
  margin-top: 15px;
`

const contentStyle = css`
  min-height: calc(100vh - 45px);
  padding: 0px 40px;
`

export default withAuthenticator(Router);