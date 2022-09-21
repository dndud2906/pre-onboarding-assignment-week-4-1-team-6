import { getUserData, getUsers } from 'apis';
import { useQueries } from 'react-query';
import { Pagination, Table } from 'antd';
import { useRecoilState } from 'recoil';
import { usersState } from 'recoil/users';
import { USER_TABLE_COLUMNS } from 'constants';
import PropTypes from 'prop-types';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { removeToken } from 'utils/Storage';

Users.propTypes = {
  params: PropTypes.string.isRequired,
  pathname: PropTypes.string.isRequired,
};

export default function Users({ params, pathname }) {
  const navigate = useNavigate();
  const search = new URLSearchParams(params);
  const limit = search.get('_limit');
  const page = search.get('_page');
  const [total, setTotal] = useState(0);
  const [users, setUsers] = useRecoilState(usersState);
  const [getAllUser, getUsersPage] = useQueries([
    {
      queryKey: ['all_users'],
      queryFn: () => getUsers(),
      onSuccess: ({ data }) => {
        const filterData = data.filter((user) => user.name !== undefined);
        setTotal(filterData.length);
      },
      onError: (error) => {
        console.log('Users.js => ', error);
        alert('재로그인을 해주세요.');
        removeToken();
        navigate('/');
      },
    },
    {
      queryKey: ['users', params],
      queryFn: () => getUserData(params),
      onSuccess: ({ data }) => {
        setUsers([...data.filter((user) => user.name !== undefined)]);
      },
      onError: (error) => {
        console.log('Users.js user data page => ', error);
      },
    },
  ]);

  const handlePagination = (clickPage) => {
    navigate(`${pathname}?_page=${clickPage}&_limit=${limit}`);
  };

  return (
    <>
      <Table
        rowKey={'id'}
        columns={USER_TABLE_COLUMNS}
        dataSource={users}
        pagination={false}
      />
      <Pagination
        className="m-5 text-center"
        defaultCurrent={page}
        total={total}
        defaultPageSize={limit}
        onChange={handlePagination}
        responsive
        showSizeChanger={false}
      />
    </>
  );
}
