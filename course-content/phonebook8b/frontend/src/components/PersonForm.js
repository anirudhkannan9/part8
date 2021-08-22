import { React, useState } from 'react'
import { useMutation } from '@apollo/client'
import { CREATE_PERSON, ALL_PERSONS } from '../queries'

const PersonForm = ( { setError }) => {
    const [ name, setName ] = useState('')
    const [ phone, setPhone ] = useState('')
    const [ street, setStreet ] = useState('')
    const [ city, setCity ] = useState('')

    //hook returns an array; first element of this array is the function that 'causes' the mutation

    const [ createPerson ] = useMutation(CREATE_PERSON, {
        //keep the cache in sync by fetching all persons again whenever a new person is created
        // refetchQueries: [ { query: ALL_PERSONS }],
        onError: (error) => {
            setError(error.graphQLErrors[0].message)
        },
        //handling updating the cache ourselves so query doesn't have to rerun with each update. Apollo calls this update callback after the mutation
        update: (store, response ) => {
            const dataInStore = store.readQuery({ query: ALL_PERSONS })
            store.writeQuery({
                query: ALL_PERSONS,
                data: {
                    ...dataInStore,
                    allPersons: [ ...dataInStore.allPersons, response.data.addPerson ]
                }
            })
            
        }
    })

    const submit = event => {
        event.preventDefault()

        createPerson( { variables: { 
            name, street, city,
            phone: phone.length > 0 ? phone : null  
        } 
    })

        setName('')
        setPhone('')
        setStreet('')
        setCity('')
    }

    return (
        <div>
            <h2> create new</h2>
            <form onSubmit={submit}>
                <div>
                    name <input
                            value={name}
                            onChange={ ({ target }) => setName(target.value)}
                        />
                </div>
                <div>
                    phone <input 
                            value={phone}
                            onChange={ ({target}) => setPhone(target.value)}
                          />
                </div>
                <div>
                    street <input
                            value={street}
                            onChange={ ({target}) => setStreet(target.value) }
                          />
                </div>
                <div>
                    city <input
                            value={city}
                            onChange={ ({ target }) => setCity(target.value)} 
                    
                         />    
                </div>
                <button type='submit'> add! </button>      

            </form>
        </div>
    )
}

export default PersonForm


