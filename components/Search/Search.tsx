import { IconX } from '@tabler/icons-react';
import { FC } from 'react';

import { useTranslation } from 'next-i18next';

import cn from 'classnames';

interface Props {
  placeholder: string;
  searchTerm: string;
  onSearch: (searchTerm: string) => void;
}
const Search: FC<Props & React.HTMLAttributes<HTMLDivElement>> = (props) => {
  const { t } = useTranslation('sidebar');
  const { placeholder, searchTerm, onSearch, ...otherProps } = props;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onSearch(e.target.value);
  };

  const clearSearch = () => {
    onSearch('');
  };

  return (
    <div className={cn('relative flex items-center', otherProps?.className)}>
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        className="absolute left-2"
      >
        <path
          d="M12.7508 11.35L14.9008 13.5C15.1008 13.7 15.1008 14 14.9008 14.2L14.2008 14.9C14.0008 15.1 13.7008 15.1 13.5008 14.9L11.4008 12.8C10.3008 13.6 9.00078 14.05 7.55078 14.05C3.95078 14.05 1.05078 11.15 1.05078 7.55005C1.05078 3.95005 3.95078 1.05005 7.55078 1.05005C11.1508 1.05005 14.0508 3.95005 14.0508 7.55005C14.0008 8.95005 13.5508 10.25 12.7508 11.35ZM7.50078 13C10.5508 13 13.0008 10.55 13.0008 7.50005C13.0008 4.45005 10.5508 2.00005 7.50078 2.00005C4.45078 2.00005 2.00078 4.45005 2.00078 7.50005C2.00078 10.55 4.45078 13 7.50078 13Z"
          fill="#C9BEC3"
        />
      </svg>
      <input
        className="w-full flex-1 rounded border border-[rgba(0, 0, 0, 0.08)] outline-none bg-[#ffffff] pl-7 py-3 pr-10 text-[14px] leading-3 text-[#322221] inputPlaceholderSourceCodePro "
        type="text"
        placeholder={t(placeholder) || ''}
        value={searchTerm}
        onChange={handleSearchChange}
      />

      {searchTerm && (
        <IconX
          className="absolute  z-10 right-4 cursor-pointer text-neutral-300 hover:text-neutral-400"
          size={18}
          onClick={clearSearch}
        />
      )}
    </div>
  );
};

export default Search;
