const {spawn, spawnSync, exec, execSync} = require('child_process')

const defaultTag = "latest"

const imageName = (projectName, dockerfileName) => {
  return imageNameWithTag(projectName, dockerfileName, defaultTag)
}

const containerName = (projectName, dockerfileName) => {
  return `voila-${projectName}-${dockerfileName}`
}

const imageNameWithTag = (projectName, dockerfileName, tag) => {
  return `voila-${projectName}-${dockerfileName}:${tag}`
}

const isContainerRunning = (containerName) => {
  const containerNames =
    execSync(`docker container ls --format "{{json .Names }}"`)
      .toString()
      .split('\n').map(n => n.slice(1, -1))

  return containerNames.includes(containerName)
}

const containerStatus = (containerName) => {
  if (isContainerRunning(containerName)) {
    return 'running'
  } else {
    return 'stopped'
  }
}

const startContainer = (volumes, ports, containerName, imageName) => {
  const args = ['run', '--rm', '-dt']

  volumes.forEach(v => {
    args.push(`--volume=${v}`)
  })

  ports.forEach(p => {
    args.push(`--publish=${p}`)
  })

  args.push(`--name=${containerName}`)
  args.push(imageName)

  return spawnSync('docker', args)
}

const stopContainer = (localdir, workdir, containerName) => {
  const args = ['container', 'stop', containerName]

  spawnSync('docker', args)
}

const runCommand = (containerName, workdir, command) => {
  const args = ['exec', '-it', '-w', workdir, containerName, '/bin/bash', '-c', command]

  return spawn('docker', args, { stdio: 'inherit' })
}

const runCommandAsync = (containerName, workdir, command) => {
  const args = ['exec', '-d', '-w', workdir, containerName, '/bin/bash', '-c', command]

  return spawn('docker', args)
}

const buildImage = (imageName, dockerfile, isNoCache, isPull) => {
  const noCache = (isNoCache) ? '--no-cache' : ''
  const pull = (isPull) ? '--pull' : ''

  return execSync(`docker build ${noCache} ${pull} -t ${imageName} -f- . <<EOF\n${dockerfile}\nEOF`)
}

const sshContainer = (containerName, workdir) => {
  const args = ['exec', '-it', '-w', workdir, containerName, '/bin/bash']

  return spawn('docker', args, { stdio: 'inherit' })
}

module.exports = {
  imageName,
  containerName,
  imageNameWithTag,
  isContainerRunning,
  containerStatus,
  startContainer,
  stopContainer,
  runCommand,
  runCommandAsync,
  buildImage,
  sshContainer
}
