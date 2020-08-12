import * as core from '@actions/core'
import * as action from './action'
import * as utility from './utility'

run()

async function run(): Promise<void> {
  try {
    const branch = core.getInput('branch', {required: true})
    const state = core.getInput('state', {required: true})
    const repository = utility.getRepository()
    const config = await utility.readConfigAny()
    const result = await action.createChangelog(repository.owner, repository.repo, branch, state, config)

    await utility.setOutput(result)
  } catch (error) {
    core.setFailed(error.message)
  }
}
