import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: '/engagements', destination: '/squads', permanent: false },
      {
        source: '/engagements/:id((?!new$)[^/]+)',
        destination: '/squads/:id',
        permanent: false,
      },
      { source: '/engagements/:id/team', destination: '/squads/:id', permanent: false },
      {
        source: '/engagements/:id/team/roles/:roleId',
        destination: '/squads/:id/roles/:roleId',
        permanent: false,
      },
      { source: '/engagements/:id/team/gaps', destination: '/squads/:id/gaps', permanent: false },
      { source: '/org-design', destination: '/people', permanent: false },
      { source: '/org-design/graph', destination: '/people/graph', permanent: false },
      { source: '/playbook', destination: '/practice/pillars', permanent: false },
    ];
  },
};

export default nextConfig;
