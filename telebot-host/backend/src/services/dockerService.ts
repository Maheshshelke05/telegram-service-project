import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

interface CreateOpts {
  userId: number;
  botId: number | string;
  token: string;
}

const imageName = 'telebot-engine:latest';

export default {
  async createContainer(opts: CreateOpts) {
    const name = `bot-${opts.userId}-${opts.botId}`;
    // create container
    const container = await docker.createContainer({
      Image: imageName,
      name,
      Env: [`TELEGRAM_TOKEN=${opts.token}`],
      HostConfig: {
        RestartPolicy: { Name: 'unless-stopped' }
      }
    });
    await container.start();
    return { id: container.id, name };
  },

  async stopAndRemoveContainer(containerId: string) {
    try {
      const container = docker.getContainer(containerId);
      await container.stop().catch(() => {});
      await container.remove().catch(() => {});
    } catch (err) {
      console.error('stop/remove error', err);
      throw err;
    }
  },

  async getContainerLogs(containerId: string) {
    const container = docker.getContainer(containerId);
    const stream = await container.logs({ stdout: true, stderr: true, tail: 200 });
    return stream.toString();
  }
};
