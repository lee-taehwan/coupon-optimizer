import React from 'react';
import { SiGithub, SiInstagram } from 'react-icons/si';
// import { SiGithub, SiInstagram, SiLinkedin } from 'react-icons/si';
import { TbWorld } from 'react-icons/tb';
import { FiMail } from 'react-icons/fi';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-slate-100 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-col items-center gap-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            &copy; 2025. lee-taehwan All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <a href="https://github.com/lee-taehwan" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
              <SiGithub size={20} />
            </a>
            {/* 링크드인 생성 후 추가 */}
            {/* <a href="#" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
              <SiLinkedin size={20} />
            </a> */}
            <a href="https://lee-taehwan.vercel.app" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
              <TbWorld size={22} />
            </a>
            <a href="mailto:soslth@naver.com" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
              <FiMail size={22} />
            </a>
            <a href="https://www.instagram.com/tae.fit_45" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors">
              <SiInstagram size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 