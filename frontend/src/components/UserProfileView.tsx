import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface User {
  _id: string;
  UID: string;
  name: string;
  email: string;
  role: string;
  active_projects: string[];
  total_projects: number;
  verified: boolean;
  adminVerified: boolean;
  isSuspended: boolean;
  createdAt: string;
  updatedAt: string;
}

interface Client {
  _id: string;
  userId: string;
  description: string;
  requirements: string;
  skillset: string[];
  credits: number;
  createdAt: string;
  updatedAt: string;
}

interface Freelancer {
  _id: string;
  userId: string;
  bio: string;
  hourlyRate: number;
  education: string[];
  experience: string[];
  portfolios: string[];
  servicesList: string[];
  skills: string[];
  languages: string[];
  credits: number;
  createdAt: string;
  updatedAt: string;
}

interface ProjectManager {
  _id: string;
  userId: string;
  phoneNumber: string;
  address: string;
  languages: string[];
  domains: string[];
  clients: string[];
}

interface UserProfileViewProps {
  user: User;
  details: Client | Freelancer | ProjectManager;
}

const UserProfileView: React.FC<UserProfileViewProps> = ({ user, details }) => {
  const renderClientView = (client: Client) => (
    <Card>
      <CardHeader>
        <CardTitle>{user.name} - Client Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Description:</strong> {client.description}</p>
        <p><strong>Requirements:</strong> {client.requirements}</p>
        <div><strong>Skillset:</strong> 
          {client.skillset.map((skill, index) => (
            <Badge key={index} variant="secondary" className="mr-2 mt-2">{skill}</Badge>
          ))}
        </div>
        <p><strong>Credits:</strong> {client.credits}</p>
        <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );

  const renderFreelancerView = (freelancer: Freelancer) => (
    <Card>
      <CardHeader>
        <CardTitle>{user.name} - Freelancer Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Bio:</strong> {freelancer.bio}</p>
        <p><strong>Hourly Rate:</strong> ${freelancer.hourlyRate}/hr</p>
        <div><strong>Skills:</strong> 
          {freelancer.skills.map((skill, index) => (
            <Badge key={index} variant="secondary" className="mr-2 mt-2">{skill}</Badge>
          ))}
        </div>
        <div><strong>Languages:</strong> 
          {freelancer.languages.map((language, index) => (
            <Badge key={index} variant="outline" className="mr-2 mt-2">{language}</Badge>
          ))}
        </div>
        <p><strong>Education:</strong> {freelancer.education.join(', ')}</p>
        <p><strong>Experience:</strong> {freelancer.experience.join(', ')}</p>
        <p><strong>Portfolios:</strong> {freelancer.portfolios.join(', ')}</p>
        <p><strong>Services:</strong> {freelancer.servicesList.join(', ')}</p>
        <p><strong>Credits:</strong> {freelancer.credits}</p>
        <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );

  const renderProjectManagerView = (projectManager: ProjectManager) => (
    <Card>
      <CardHeader>
        <CardTitle>{user.name} - Project Manager Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <p><strong>Username:</strong> {user.UID}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Phone Number:</strong> {projectManager.phoneNumber}</p>
        <p><strong>Address:</strong> {projectManager.address}</p>
        <div><strong>Languages:</strong> 
          {projectManager.languages.map((language, index) => (
            <Badge key={index} variant="outline" className="mr-2 mt-2">{language}</Badge>
          ))}
        </div>
        <div><strong>Domains:</strong> 
          {projectManager.domains.map((domain, index) => (
            <Badge key={index} variant="secondary" className="mr-2 mt-2">{domain}</Badge>
          ))}
        </div>
        <p><strong>Number of Clients:</strong> {projectManager.clients.length}</p>
        <p><strong>Active Projects:</strong> {user.active_projects.length}</p>
        <p><strong>Total Projects:</strong> {user.total_projects}</p>
        <p><strong>Admin Verified:</strong> {user.adminVerified ? 'Yes' : 'No'}</p>
        <p><strong>Account Status:</strong> {user.isSuspended ? 'Suspended' : 'Active'}</p>
        <p><strong>Email Verified:</strong> {user.verified ? 'Yes' : 'No'}</p>
        <p><strong>Member since:</strong> {new Date(user.createdAt).toLocaleDateString()}</p>
        <p><strong>Last Updated:</strong> {new Date(user.updatedAt).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  );

  return (
    <div>
      {user.role === 'client' && renderClientView(details as Client)}
      {user.role === 'freelancer' && renderFreelancerView(details as Freelancer)}
      {user.role === 'project manager' && renderProjectManagerView(details as ProjectManager)}
    </div>
  );
};

export default UserProfileView;