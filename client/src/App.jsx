import { useState, lazy } from 'react';
import { Button, Form, Input, Alert, Typography } from 'antd';

import { createUser } from './apis/users';
const ChatApp = lazy(() => import('./components/chatApp'));

import './App.css'

function LoginForm({ setUserEmail }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onFinish = async (values) => {
    setIsLoading(true);

    try {
      const { data } = await createUser(values.email);

      setError(null);
      setUserEmail(data);
    } catch (error) {
      setError(error);
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  const onFinishFailed = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      name="basic"
      wrapperCol={{
        span: 18,
      }}
      initialValues={{
        remember: true,
      }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >

      <Form.Item
        label="Email"
        name="email"
        rules={[
          {
            required: true,
            message: 'Please input your email!',
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item label={null}>
        <Button type="primary" htmlType="submit" loading={isLoading}>
          Start Chat
        </Button>
      </Form.Item>

      {error && <Alert message={error.message} type="error" showIcon />}

    </Form>
  );
}

function App() {
  const [userEmail, setUserEmail] = useState(null);

  console.log('userEmail =====>', userEmail);

  return (
    <div>
      <Typography.Title level={1}>Chat Room App</Typography.Title>

      <br />

      {userEmail
        ? <ChatApp userEmail={userEmail} setUserEmail={setUserEmail} key={Date.now()} />
        : <LoginForm setUserEmail={setUserEmail} />
      }
    </div>
  )
}

export default App
