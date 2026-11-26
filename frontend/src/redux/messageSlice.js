import { createSlice } from "@reduxjs/toolkit";

const messageSlice=createSlice({
    name:"message",
    initialState:{
      messages:[],
      artifacts:[],
      isLoading:false,
      agent:"auto"
    },
    reducers:{
       setMessages:(state,action)=>{
        state.messages=action.payload
       },
        addMessage:(state,action)=>{
        state.messages.push(action.payload)
       },
       setArtifacts:(state,action)=>{
        state.artifacts=action.payload
       },
       setIsLoading:(state,action)=>{
        state.isLoading=action.payload
       },
       setAgent:(state,action)=>{
        state.agent=action.payload
       }

    }
   
})

export const {setMessages,addMessage,setArtifacts,setIsLoading,setAgent}=messageSlice.actions
export default messageSlice.reducer

