import * as utility from './utility'
import * as changelog from './changelog'

export async function createChangelog(owner: string, repo: string, branch: string, state: string, config: any): Promise<string> {
  const milestones = await getMilestones(owner, repo, branch, state, config.changelog)

  return await formatChangelog(owner, repo, milestones, config)
}

async function formatChangelog(owner: string, repo: string, milestones: any[], config: any): Promise<string> {
  let format = ''

  if (config.changelog.body !== '') {
    milestones.sort((a, b) => {
      const path = config.changelog.milestoneDate
      const aDate = utility.getValue(a, path)
      const bDate = utility.getValue(b, path)

      return bDate.localeCompare(aDate)
    })

    const values = {
      milestones: milestones,
      milestonesFormatted: await formatMilestones(owner, repo, milestones, config)
    }

    format += utility.formatValues(config.changelog.body, values)
    format = utility.normalize(format)
  }

  return format
}

async function formatMilestones(owner: string, repo: string, milestones: any[], config: any): Promise<string> {
  let format = ''

  for (const milestone of milestones) {
    const milestoneDate = utility.getValue(milestone, config.changelog.milestoneDate)
    const date = utility.formatDate(new Date(milestoneDate), config.changelog.dateFormat)
    const milestoneChangelog = await changelog.createChangelog(owner, repo, milestone.number, config.milestone)
    const values = {
      milestones: milestones,
      milestone: milestone,
      date: date,
      milestoneChangelog: milestoneChangelog,
      repository: `${owner}/${repo}`
    }

    format += utility.formatValues(config.changelog.milestone, values)
    format += '\n'
  }

  return format
}

async function getMilestones(owner: string, repo: string, branch: string, state: string, config: any): Promise<any[]> {
  const result = []
  let milestones = []

  if (branch === 'all') {
    milestones = await utility.getMilestones(owner, repo, state)
  } else {
    milestones = await getMilestonesByBranch(owner, repo, state, branch)
  }

  for (const milestone of milestones) {
    const date = utility.getValue(milestone, config.milestoneDate)

    if (date !== '') {
      result.push(milestone)
    }
  }

  return result
}

async function getMilestonesByBranch(owner: string, repo: string, state: string, branch: string): Promise<any[]> {
  const milestones = await utility.getMilestones(owner, repo, state)
  const result = []

  for (const milestone of milestones) {
    if (await utility.containsInBranch(owner, repo, branch, milestone.title)) {
      result.push(milestone)
    }
  }

  return result
}
