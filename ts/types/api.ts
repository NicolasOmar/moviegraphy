/** Used for `[CREATE]` or `[UPDATE]` API methods
 * @typeParam InputEntity - Data structure for database insert or update
 * @typeParam OutputEntity - Data structure that will the return value. `boolean` by default
 * @returns A `Promise` in shape of a `OutputEntity`
 */
export type CreateOrUpdateOne<InputEntity, OutputEntity = boolean> = (
  _entity: InputEntity
) => Promise<OutputEntity>

/** Used for `[DELETE]` API method
 * @param _identifier - string identifier to select an specific registry
 * and deleted from the database
 * @returns A `Promise` in shape of a boolean
 */
export type DeleteOne = (_identifier: string) => Promise<boolean>

/** Used for `[GET]` API method. Focused on a list of elements/registries
 * @typeParam InputEntity - Data structure for database query (could be a string
 * or an object for complex queries). `string` by default
 * @typeParam OutputEntity - Output data structure list. `boolean` by default
 * @returns A `Promise` in shape of a list of `OutputEntity`
 */
export type GetMany<InputEntity = string, OutputEntity = boolean> = (
  _finder: InputEntity
) => Promise<OutputEntity[]>

/** Used for `[GET]` API method. Focused on a single element/registry
 * @typeParam InputEntity - Data structure for database query (could be a string
 * or an object for complex queries). `string` by default
 * @typeParam OutputEntity - Output data structure. `boolean` by default
 * @returns A `Promise` in shape of a single `OutputEntity`
 */
export type GetOne<InputEntity = string, OutputEntity = boolean> = (
  _finder: InputEntity
) => Promise<OutputEntity>

/** Error carrying an HTTP status code, so API endpoints can translate it into a Response without inspecting error internals. */
export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)

    this.name = 'HttpError'
    this.status = status
  }
}
