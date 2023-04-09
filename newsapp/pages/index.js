import styles from '@/styles/Home.module.css'
import useSWR from 'swr'
import { useState } from 'react';
import Spinner from '@/components/spinner';
import Error from '@/components/error';
import useScrollPercentage from '@/components/useScrollProcentage';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';

const fetcher = (...args) => fetch(...args).then(res => res.json());
const newsApiKey = '339e56b6d42f4a0ab9c4f820c0a35558';

export default function Home() {
  const [filters, setFilters] = useState({ q: '', from: '', to: '', category: '', county: 'us' });

  return (<>
    <Head>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" />
      <link href="https://fonts.googleapis.com/css2?family=Almarai:wght@300;400;700;800&display=swap" rel="stylesheet" />
    </Head>
    <section className={styles.main_container} id='main'>
      <LeftNav filters={filters} setFilters={setFilters} />
      <TopNav filters={filters} setFilters={setFilters} />
      <MainArea filters={filters} />
    </section>
  </>

  )
}

function LeftNav({ filters, setFilters }) {
  return (
    <div className={styles.left_nav}>

    </div>
  );
}

function TopNav({ filters, setFilters }) {
  return (
    <div className={styles.nav_top}>
      <div className={styles.navContents}>
        <div>
          <div>
            <Image src="/HCI_logo1.png" width={120} height={100} alt='News logo'></Image>
          </div>
          <div className={styles.currentDate}>{new Date(Date.now()).toDateString().slice(4, 11)}</div>
        </div>
        <SearchBar />
      </div>
    </div>
  );
}

function SearchBar() {
  return (
    <div className={styles.searchSection}>
      <div className={styles.search}>
        <input type="text" name="search" className={styles.round} placeholder='Search' />
        <div className={styles.imgDiv}>
          <Image src="/images/searchIcon.png" width={24} height={24} alt='search icon' />
        </div>
      </div>
      <div className={`${styles.imgDiv} ${styles.arrowIconBtn}`}>
        <Image src="/images/searchArrowIcon.png" width={32} height={32} alt='search arrow icon' />
      </div>
    </div>
  )
}
function MainArea({ filters }) {
  const [newsToShow, setNewsToShow] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [scrollRef, scrollPercentage] = useScrollPercentage();
  const { topNews, isLoading, isError } = getTopNews(currentPage);

  console.log(scrollPercentage);

  hasAppliedFilters(filters);

  if (isLoading) return <Spinner />
  if (isError) return <Error />

  if (newsToShow === null) {
    setNewsToShow(topNews['articles']);
  }

  return (
    <>
      {newsToShow !== null &&
        <div className={styles.main_area_container}>
          <h2 className={styles.page_title}>{`${hasAppliedFilters(filters) ? 'For you' : 'Top Stories'}`}</h2>
          <div className={styles.story_grid}>
            {[newsToShow.shift()].map(bigStory => <BigStoryCard key={bigStory['title']} story={bigStory} />)}
            {newsToShow.map(regularStory => <RegularStoryCard key={regularStory['title']} story={regularStory} />)}
          </div>
        </div>
      }
    </>
  );
}

function getTopNews(page = 0, page_size = 20) {
  const { data, error, isLoading } = useSWR(`https://newsapi.org/v2/top-headlines?language=en&pageSize=${page_size}&page=${page}&apiKey=${newsApiKey}`, fetcher);

  return {
    topNews: data,
    isLoading,
    isError: error
  }
}

function hasAppliedFilters(filters) {
  const filters_to_skip = ['county']
  for (let filter in filters) {
    if (filters_to_skip.includes(filter)) continue;
    if (filters[filter]) {
      return true;
    }
  }
}

function RegularStoryCard({ story }) {
  return (
    <Link href={story['url']} style={{ textDecoration: 'none' }}>
      <div className={styles.regular_story + ' ' + styles.card}>
        <div className={styles.main_story_area}>
          <div className={styles.story_content}>
            <div className={styles.story_source}>{story['source']['name'] || ''}</div>
            <div className={styles.story_title}>{`${story['title'].split(' ').slice(0, 12).join(' ')}`}</div>
          </div>
          <div className={styles.story_image}>
            <Image src={story['urlToImage']} alt={story['title']} width={130} height={130} />
          </div>
        </div>
        <div className={styles.story_footer}>
          <p>{`${calculatePublishTime(story['publishedAt'])} • ${story['author'] || 'anonymous'}`}</p>
          <p className={styles.read_article_btn}>{'➤'}</p>
        </div>
      </div>
    </Link>
  );
}

function calculatePublishTime(publishedDate) {
  const [date, time] = publishedDate.split('Z')[0].split('T');
  const [year, month, day] = date.split('-');
  const [hours, minutes, seconds] = time.split(':');

  const now = new Date();

  if (year != now.getFullYear()) {
    return +now.getFullYear() - +year + 'year(s) ago';
  }
  if (month != now.getMonth() + 1) {
    return +now.getMonth() + 1 - +month + 'month(s) ago';
  }
  if (day != now.getDate()) {
    return +now.getDate() - +day + 'day(s) ago';
  }
  if (hours != now.getHours()) {
    return +now.getHours() - +hours + 'hour(s) ago';
  }
  if (minutes != now.getMinutes()) {
    return +now.getMinutes() - +minutes + 'minute(s) ago';
  }
  if (seconds != now.getSeconds()) {
    return +now.getSeconds() - +seconds + 'second(s) ago';
  }
}

function BigStoryCard({ story }) {
  return (
    <div className={styles.big_story + ' ' + styles.card}>
      <div className={styles.main_story_area}>
        <div className={styles.story_image}>
          <img src={story['urlToImage']} alt={story['title']} />
        </div>
        <div className={styles.story_content}>
          <div className={styles.story_source}>{story['source']['name'] || ''}</div>
          <div className={styles.story_title}>{story['title']}</div>
        </div>
      </div>
      <div className={styles.story_footer}>
        <p>{`${calculatePublishTime(story['publishedAt'])} • ${story['author'] || 'anonymous'}`}</p>
        <p className={styles.read_article_btn}>{'➤'}</p>
      </div>

    </div>
  );
}
