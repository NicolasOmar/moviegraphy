import { type ActorsModel } from '@models'
import { atom } from 'nanostores'

export const $contextActorList = atom<ActorsModel[]>([])
export const $contextSelectedActor = atom<ActorsModel | null>(null)

export const setActorListOnContext = (_actorList: ActorsModel[]) =>
  $contextActorList.set(_actorList)

export const addActorToListContext = (_updatedActor: ActorsModel) => {
  $contextActorList.set([...$contextActorList.get(), _updatedActor])
}

export const updateActorOnListContext = (_updatedActor: ActorsModel) => {
  $contextActorList.set(
    $contextActorList.get().map(_actor => (_actor.id === _updatedActor.id ? _updatedActor : _actor))
  )
}

export const deleteActorOnListContext = (_actorId: string) => {
  $contextActorList.set($contextActorList.get().filter(({ id }) => id !== _actorId))
}

export const updateSelectedActorOnContext = (_updatedActor: ActorsModel | null) => {
  $contextSelectedActor.set(_updatedActor)
}
