import './App.css'
import React, { useState } from 'react'
import { gql, useQuery } from '@apollo/client'

import Notify from './components/Notify'
import Persons from './components/Persons'
import PersonForm from './components/PersonForm'
import PhoneForm from './components/PhoneForm'


import { ALL_PERSONS } from './queries'


const App = () => {
  const [ errorMessage, setErrorMessage ] = useState(null)


  const result = useQuery(ALL_PERSONS)//, {
    //  in order to render added person immediately w/o needing to refresh the page. Downside: 'all the pointless web traffic'
    //  pollInterval: 2000
  //})

  if (result.loading) {
    return <div>...loading</div>
  }

  const notify = message => {
    setErrorMessage(message)
    setTimeout(() => {
      setErrorMessage(null)
    }, 7000)
  } 

  return (
    <div>
      <Notify errorMessage={ errorMessage } />
      <Persons persons={ result.data.allPersons } />
      <PersonForm setError={ notify }/>
      <PhoneForm setError={ notify }/>
    </div>
  )
}

export default App
