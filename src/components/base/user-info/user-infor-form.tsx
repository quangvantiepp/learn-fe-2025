import React from 'react';
import styled from '@emotion/styled';

type UserInfo = {
  name: string;
  userId: string;
  role: string;
};

type Props = {
  user: UserInfo;
};

const FormContainer = styled.div`
  display: flex;
  max-width: 600px;
  margin: 0 auto;
  padding: 16px;
  border: 1px solid #ddd;
  border-radius: 12px;
  background-color: #f9f9f9;
`;

const LabelColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  font-weight: 600;
  text-align: left;
`;

const ValueColumn = styled.div`
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 16px;
  text-align: left;
`;

export const UserInfoForm: React.FC<Props> = ({ user }) => {
  return (
    <FormContainer>
      <LabelColumn>
        <div>Name:</div>
        <div>User ID:</div>
        <div>Role:</div>
      </LabelColumn>
      <ValueColumn>
        <div>{user.name}</div>
        <div>{user.userId}</div>
        <div>{user.role}</div>
      </ValueColumn>
    </FormContainer>
  );
};
