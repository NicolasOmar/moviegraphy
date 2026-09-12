import { beforeEach, describe, expect, it } from 'vitest'

import { actorMocks } from '../../ts/mocks'
import {
  $contextActorList,
  $contextSelectedActor,
  addActorToListContext,
  deleteActorOnListContext,
  setActorListOnContext,
  updateActorOnListContext,
  updateSelectedActorOnContext
} from '../actors'

beforeEach(() => {
  $contextActorList.set([])
  $contextSelectedActor.set(null)
})

describe('setActorListOnContext', () => {
  it('replaces the actor list atom with the given list', () => {
    setActorListOnContext(actorMocks)

    expect($contextActorList.get()).toEqual(actorMocks)
  })
})

describe('addActorToListContext', () => {
  it('appends the given actor to the end of the list, keeping its id unchanged', () => {
    setActorListOnContext(actorMocks)
    const newActor = { ...actorMocks[0], id: 'new-actor-id', name: 'New Actor' }

    addActorToListContext(newActor)

    expect($contextActorList.get()).toEqual([...actorMocks, newActor])
  })
})

describe('updateActorOnListContext', () => {
  it('replaces only the entry matching the given id, leaving the rest untouched', () => {
    setActorListOnContext(actorMocks)
    const [firstActor, ...restOfActors] = actorMocks
    const updatedActor = { ...firstActor, name: 'Updated Name' }

    updateActorOnListContext(updatedActor)

    expect($contextActorList.get()).toEqual([updatedActor, ...restOfActors])
  })
})

describe('deleteActorOnListContext', () => {
  it('removes the actor with the given id from the list', () => {
    setActorListOnContext(actorMocks)
    const [actorToDelete, ...restOfActors] = actorMocks

    deleteActorOnListContext(actorToDelete.id)

    expect($contextActorList.get()).toEqual(restOfActors)
  })
})

describe('updateSelectedActorOnContext', () => {
  it('sets and clears the selected actor atom', () => {
    const [actor] = actorMocks

    updateSelectedActorOnContext(actor)
    expect($contextSelectedActor.get()).toEqual(actor)

    updateSelectedActorOnContext(null)
    expect($contextSelectedActor.get()).toBeNull()
  })
})
