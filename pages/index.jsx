import { useContext, useEffect, useState } from 'react'
import Head from 'next/head'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'
import styles from 'styles/Home.module.scss'
import { NotFoundRedirectCtx } from 'lib/context/notFoundRedirect'
import TableContainer from 'components/Table/TableContainer'
import TableBody from 'components/Table/TableBody'

export default function Home() {
  const { onNavLeft } = useContext(NotFoundRedirectCtx)

  ChartJS.register(
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend
  );

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Chart.js Bar Chart',
      },
    },
  };

  const labels = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const data = {
    labels: labels,
    datasets: [{
      label: 'Activity',
      data: [65, 59, 80, 81, 56, 55, 40],
      backgroundColor: [
        'rgba(255, 99, 132, 0.2)',
        'rgba(255, 159, 64, 0.2)',
        'rgba(255, 205, 86, 0.2)',
        'rgba(75, 192, 192, 0.2)',
        'rgba(54, 162, 235, 0.2)',
        'rgba(153, 102, 255, 0.2)',
        'rgba(201, 203, 207, 0.2)'
      ],
      borderColor: [
        'rgb(255, 99, 132)',
        'rgb(255, 159, 64)',
        'rgb(255, 205, 86)',
        'rgb(75, 192, 192)',
        'rgb(54, 162, 235)',
        'rgb(153, 102, 255)',
        'rgb(201, 203, 207)'
      ],
      borderWidth: 1
    }]
  }

  return (
    <>
      <Head>
        <title>Admin Hospice Medical</title>
        <meta name="description" content="tampilan dashboard admin hospice medical" />
      </Head>
      <div className={onNavLeft ? `${styles['wrapp']} ${styles['wrapp-active']}` : styles['wrapp']}>
        <div className={styles['container']}>
          <div className={styles['content']}>
            <h1 className={styles['title']}>Activity</h1>

            <TableContainer styleWrapp={{
              margin: '50px 0 0 0',
              height: '600px',
              alignItems: 'center'
            }}>
              <Bar
                options={options}
                data={data}
                className={styles['trafic-presence']}
              />
            </TableContainer>
          </div>
        </div>
      </div>
    </>
  )
}