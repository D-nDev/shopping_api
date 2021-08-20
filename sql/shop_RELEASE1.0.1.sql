--
-- PostgreSQL database dump
--

-- Dumped from database version 13.3
-- Dumped by pg_dump version 13.3

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: adminpack; Type: EXTENSION; Schema: -; Owner: -
--

CREATE EXTENSION IF NOT EXISTS adminpack WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION adminpack; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION adminpack IS 'administrative functions for PostgreSQL';


SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: bills_pay; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills_pay (
    id integer NOT NULL,
    provider_id integer,
    amount numeric NOT NULL,
    currency character varying(5) DEFAULT 'BRL'::character varying NOT NULL,
    method_id integer,
    deadline date NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    user_id integer
);


ALTER TABLE public.bills_pay OWNER TO postgres;

--
-- Name: bills_pay_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_pay_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bills_pay_id_seq OWNER TO postgres;

--
-- Name: bills_pay_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_pay_id_seq OWNED BY public.bills_pay.id;


--
-- Name: bills_receive; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.bills_receive (
    id integer NOT NULL,
    user_id integer NOT NULL,
    sale_header_id integer NOT NULL,
    amount numeric NOT NULL,
    currency character varying(3) DEFAULT 'BRL'::character varying NOT NULL,
    method_id integer NOT NULL,
    deadline date NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    refunded boolean DEFAULT false
);


ALTER TABLE public.bills_receive OWNER TO postgres;

--
-- Name: bills_receive_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.bills_receive_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.bills_receive_id_seq OWNER TO postgres;

--
-- Name: bills_receive_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.bills_receive_id_seq OWNED BY public.bills_receive.id;


--
-- Name: payment_method; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.payment_method (
    id integer NOT NULL,
    name character varying NOT NULL,
    portion_quantity integer NOT NULL,
    deleted_at date,
    daystopay integer
);


ALTER TABLE public.payment_method OWNER TO postgres;

--
-- Name: payment_method_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.payment_method_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_method_id_seq OWNER TO postgres;

--
-- Name: payment_method_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.payment_method_id_seq OWNED BY public.payment_method.id;


--
-- Name: products; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products (
    id integer NOT NULL,
    group_id integer NOT NULL,
    name character varying(100) NOT NULL,
    price numeric(10,2) NOT NULL,
    description text NOT NULL,
    add_date date DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    image character varying,
    creation_userid integer
);


ALTER TABLE public.products OWNER TO postgres;

--
-- Name: products_group; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.products_group (
    id integer NOT NULL,
    name character varying(255) NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    creation_userid integer
);


ALTER TABLE public.products_group OWNER TO postgres;

--
-- Name: products_group_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_group_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_group_id_seq OWNER TO postgres;

--
-- Name: products_group_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_group_id_seq OWNED BY public.products_group.id;


--
-- Name: products_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.products_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.products_id_seq OWNER TO postgres;

--
-- Name: products_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.products_id_seq OWNED BY public.products.id;


--
-- Name: promotional_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.promotional_codes (
    id integer NOT NULL,
    code character varying NOT NULL,
    discount numeric(10,2) NOT NULL,
    type_discount character varying(10) NOT NULL,
    deleted_at date,
    creation_userid integer,
    CONSTRAINT check_discount CHECK ((((type_discount)::text = 'percentage'::text) OR ((type_discount)::text = 'fix'::text)))
);


ALTER TABLE public.promotional_codes OWNER TO postgres;

--
-- Name: promotional_codes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.promotional_codes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.promotional_codes_id_seq OWNER TO postgres;

--
-- Name: promotional_codes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.promotional_codes_id_seq OWNED BY public.promotional_codes.id;


--
-- Name: providers; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.providers (
    id integer NOT NULL,
    document character varying(14) NOT NULL,
    name character varying(100) NOT NULL,
    country character varying(20) NOT NULL,
    state character varying(20) NOT NULL,
    product_type character varying(100) NOT NULL,
    phone character varying(25) NOT NULL,
    zip_code character varying(9) NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    creation_userid integer
);


ALTER TABLE public.providers OWNER TO postgres;

--
-- Name: providers_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.providers_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.providers_id_seq OWNER TO postgres;

--
-- Name: providers_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.providers_id_seq OWNED BY public.providers.id;


--
-- Name: req_refunds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.req_refunds (
    id integer NOT NULL,
    user_id integer NOT NULL,
    reason text NOT NULL,
    sale_header_id integer NOT NULL,
    deleted_at date
);


ALTER TABLE public.req_refunds OWNER TO postgres;

--
-- Name: req_refunds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.req_refunds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.req_refunds_id_seq OWNER TO postgres;

--
-- Name: req_refunds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.req_refunds_id_seq OWNED BY public.req_refunds.id;


--
-- Name: roles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.roles (
    id integer NOT NULL,
    name character varying(20) NOT NULL,
    deleted_at date
);


ALTER TABLE public.roles OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.roles_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.roles_id_seq OWNER TO postgres;

--
-- Name: roles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.roles_id_seq OWNED BY public.roles.id;


--
-- Name: sale_header; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_header (
    id integer NOT NULL,
    user_id integer NOT NULL,
    promotional_code_id integer,
    total numeric(10,2) NOT NULL,
    payment_method_id integer NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deadline date NOT NULL,
    deleted_at date,
    refunded boolean DEFAULT false
);


ALTER TABLE public.sale_header OWNER TO postgres;

--
-- Name: sale_header_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sale_header_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sale_header_id_seq OWNER TO postgres;

--
-- Name: sale_header_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sale_header_id_seq OWNED BY public.sale_header.id;


--
-- Name: sale_items; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sale_items (
    sale_header_id integer NOT NULL,
    line integer NOT NULL,
    product_id integer NOT NULL,
    sold_amount integer NOT NULL,
    unitary_value numeric(10,2) NOT NULL,
    discount_value numeric(10,2) NOT NULL,
    plus_value numeric(10,2) NOT NULL,
    total numeric(10,2) NOT NULL,
    deleted_at date,
    refunded boolean DEFAULT false
);


ALTER TABLE public.sale_items OWNER TO postgres;

--
-- Name: stock; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.stock (
    product_id integer NOT NULL,
    amount integer NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    creation_userid integer,
    update_userid integer
);


ALTER TABLE public.stock OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    role_id integer DEFAULT 2 NOT NULL,
    document character varying(14) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    first_name character varying(50) NOT NULL,
    last_name character varying(50) NOT NULL,
    address character varying(250) NOT NULL,
    city character varying(80) NOT NULL,
    state character varying(2) NOT NULL,
    zip_code character varying(9) NOT NULL,
    phone character varying(25) NOT NULL,
    birth_date date NOT NULL,
    creation_timestamp timestamp with time zone DEFAULT timezone('America/Sao_Paulo'::text, now()) NOT NULL,
    deleted_at date,
    reset_code character varying,
    expire_time timestamp without time zone
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: vw_cashflow; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_cashflow AS
 SELECT sum(topay.amount) AS "Bills to Pay",
    sum(toreceive.amount) AS "Bills to Receive",
    (sum(toreceive.amount) - sum(topay.amount)) AS "Cash Flow"
   FROM (public.bills_receive toreceive
     JOIN public.bills_pay topay ON ((topay.amount >= (0)::numeric)))
  WHERE ((topay.deleted_at IS NULL) AND (toreceive.deleted_at IS NULL));


ALTER TABLE public.vw_cashflow OWNER TO postgres;

--
-- Name: vw_product_data; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_product_data AS
 SELECT pr.id,
    pr.name,
    pr.group_id,
    pr.price,
    prg.name AS group_name,
    st.amount,
    (pr.price * (st.amount)::numeric) AS total_stock
   FROM ((public.products pr
     JOIN public.products_group prg ON ((prg.id = pr.group_id)))
     JOIN public.stock st ON ((st.product_id = pr.id)))
  WHERE ((pr.deleted_at IS NULL) AND (prg.deleted_at IS NULL) AND (st.deleted_at IS NULL));


ALTER TABLE public.vw_product_data OWNER TO postgres;

--
-- Name: vw_salemonth; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_salemonth AS
 SELECT sales.product_id,
    prd.name,
    prd.description,
    count(sales.sold_amount) AS quantity_sold,
    date_part('month'::text, hrd.creation_timestamp) AS month,
    max(hrd.total) AS high_sale,
    avg(hrd.total) AS average,
    sum(hrd.total) AS total_month,
    max(sales.unitary_value) AS high_unitary,
    avg(sales.unitary_value) AS average_unitary
   FROM ((public.sale_items sales
     JOIN public.products prd ON ((sales.product_id = prd.id)))
     JOIN public.sale_header hrd ON ((sales.sale_header_id = hrd.id)))
  GROUP BY sales.product_id, prd.name, prd.description, (date_part('month'::text, hrd.creation_timestamp));


ALTER TABLE public.vw_salemonth OWNER TO postgres;

--
-- Name: vw_salemonth2; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_salemonth2 AS
 SELECT sales.product_id,
    prd.name,
    prd.description,
    count(sales.sold_amount) AS quantity_sold,
    date_part('month'::text, hrd.creation_timestamp) AS month,
    max(sales.total) AS high_sale,
    avg(sales.total) AS average,
    sum(sales.total) AS total_month,
    max(sales.unitary_value) AS high_unitary,
    avg(sales.unitary_value) AS average_unitary
   FROM ((public.sale_items sales
     JOIN public.products prd ON ((sales.product_id = prd.id)))
     JOIN public.sale_header hrd ON ((sales.sale_header_id = hrd.id)))
  GROUP BY sales.product_id, prd.name, prd.description, (date_part('month'::text, hrd.creation_timestamp));


ALTER TABLE public.vw_salemonth2 OWNER TO postgres;

--
-- Name: vw_sold_30days; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_sold_30days AS
 SELECT cl.id,
    (((cl.first_name)::text || ' '::text) || (cl.last_name)::text) AS name,
    sale.creation_timestamp,
    sale.total,
    sale.payment_method_id,
    (( SELECT date_part('day'::text, (timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP) - (sale.creation_timestamp)::timestamp without time zone)) AS date_part) >= (30)::double precision) AS above_30days
   FROM (public.users cl
     JOIN public.sale_header sale ON (((
        CASE
            WHEN (date_part('day'::text, (timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP) - (sale.creation_timestamp)::timestamp without time zone)) <= (30)::double precision) THEN 1
            ELSE 0
        END = 1) AND (sale.user_id = cl.id))))
  WHERE ((cl.deleted_at IS NULL) AND (sale.deleted_at IS NULL))
  GROUP BY sale.id, cl.id, cl.first_name, cl.last_name, sale.creation_timestamp, sale.total, sale.payment_method_id;


ALTER TABLE public.vw_sold_30days OWNER TO postgres;

--
-- Name: vw_toreceive; Type: VIEW; Schema: public; Owner: postgres
--

CREATE VIEW public.vw_toreceive AS
 SELECT cl.user_id,
    usr.first_name,
    usr.last_name,
    cl.deadline,
    cl.amount,
        CASE
            WHEN (cl.deadline <= timezone('America/Sao_Paulo'::text, (CURRENT_DATE)::timestamp with time zone)) THEN 'A vencer'::text
            WHEN ( SELECT (date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) <= (30)::double precision)) THEN 'Não recebido'::text
            WHEN ( SELECT ((date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) >= (30)::double precision) AND (date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) <= (59)::double precision))) THEN '30 dias'::text
            WHEN ( SELECT ((date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) >= (60)::double precision) AND (date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) <= (89)::double precision))) THEN '60 dias'::text
            WHEN ( SELECT ((date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) >= (90)::double precision) AND (date_part('day'::text, ((cl.deadline)::timestamp without time zone - timezone('America/Sao_Paulo'::text, CURRENT_TIMESTAMP))) <= (119)::double precision))) THEN '90 dias'::text
            ELSE '120 dias'::text
        END AS sub_category
   FROM (public.bills_receive cl
     JOIN public.users usr ON ((usr.id = cl.user_id)))
  WHERE ((cl.deleted_at IS NULL) AND (usr.deleted_at IS NULL));


ALTER TABLE public.vw_toreceive OWNER TO postgres;

--
-- Name: bills_pay id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_pay ALTER COLUMN id SET DEFAULT nextval('public.bills_pay_id_seq'::regclass);


--
-- Name: bills_receive id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_receive ALTER COLUMN id SET DEFAULT nextval('public.bills_receive_id_seq'::regclass);


--
-- Name: payment_method id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method ALTER COLUMN id SET DEFAULT nextval('public.payment_method_id_seq'::regclass);


--
-- Name: products id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products ALTER COLUMN id SET DEFAULT nextval('public.products_id_seq'::regclass);


--
-- Name: products_group id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_group ALTER COLUMN id SET DEFAULT nextval('public.products_group_id_seq'::regclass);


--
-- Name: promotional_codes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_codes ALTER COLUMN id SET DEFAULT nextval('public.promotional_codes_id_seq'::regclass);


--
-- Name: providers id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers ALTER COLUMN id SET DEFAULT nextval('public.providers_id_seq'::regclass);


--
-- Name: req_refunds id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.req_refunds ALTER COLUMN id SET DEFAULT nextval('public.req_refunds_id_seq'::regclass);


--
-- Name: roles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles ALTER COLUMN id SET DEFAULT nextval('public.roles_id_seq'::regclass);


--
-- Name: sale_header id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_header ALTER COLUMN id SET DEFAULT nextval('public.sale_header_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: bills_pay; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills_pay (id, provider_id, amount, currency, method_id, deadline, creation_timestamp, deleted_at, user_id) FROM stdin;
1	1	150	BRL	8	2021-08-14	2021-08-03 15:53:32.070353+00	\N	\N
7	\N	140.47	BRL	8	2021-09-14	2021-08-15 20:50:34.924476+00	\N	1
8	\N	280.94	BRL	8	2021-09-15	2021-08-16 15:54:32.475897+00	\N	1
10	\N	261.85	BRL	8	2021-09-15	2021-08-16 23:53:23.815314+00	\N	1
11	\N	140.47	BRL	8	2021-09-16	2021-08-17 01:46:54.832761+00	\N	1
12	\N	140.47	BRL	8	2021-09-17	2021-08-18 16:04:09.271361+00	\N	1
13	\N	135.42	BRL	8	2021-09-19	2021-08-20 00:39:16.093136+00	\N	1
\.


--
-- Data for Name: bills_receive; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.bills_receive (id, user_id, sale_header_id, amount, currency, method_id, deadline, creation_timestamp, deleted_at, refunded) FROM stdin;
2	2	1	200.00	BRL	8	2021-08-30	2021-08-03 15:53:48.807866+00	\N	f
3	1	27	150.47	BRL	8	2021-08-16	2021-08-15 19:52:34.441673+00	\N	f
4	1	28	140.47	BRL	8	2021-08-16	2021-08-15 20:32:42.680754+00	2021-08-15	t
5	1	29	280.94	BRL	8	2021-08-17	2021-08-16 15:50:19.794696+00	2021-08-16	t
7	1	31	290.94	BRL	8	2021-08-17	2021-08-16 23:22:15.176733+00	\N	f
8	1	32	261.846	BRL	8	2021-08-17	2021-08-16 23:22:54.39149+00	2021-08-16	t
6	1	30	431.40	BRL	8	2021-08-17	2021-08-16 23:20:25.835941+00	\N	f
10	1	34	150.47	BRL	8	2021-08-18	2021-08-17 23:30:04.181974+00	\N	f
9	1	33	140.47	BRL	8	2021-08-18	2021-08-17 01:44:47.33526+00	2021-08-18	t
11	1	35	140.47	BRL	8	2021-08-19	2021-08-18 16:22:31.475662+00	\N	f
15	1	43	300.94	BRL	8	2021-08-20	2021-08-19 18:13:25.775201+00	\N	f
17	1	46	150.20	BRL	8	2021-08-20	2021-08-19 18:14:40.088662+00	\N	f
72	1	98	150.47	BRL	8	2021-08-20	2021-08-19 20:17:06.440198+00	\N	f
20	1	49	601.88	BRL	8	2021-08-20	2021-08-19 18:19:56.431795+00	\N	f
21	1	46	150.20	BRL	8	2021-08-20	2021-08-19 18:20:21.991991+00	\N	f
73	1	99	300.94	BRL	8	2021-08-20	2021-08-19 20:18:23.262718+00	\N	f
75	1	101	541.692	BRL	8	2021-08-20	2021-08-19 20:27:23.361645+00	\N	f
25	1	52	1053.29	BRL	8	2021-08-20	2021-08-19 18:29:14.670802+00	\N	f
76	1	102	300.94	BRL	8	2021-08-20	2021-08-19 20:28:30.700727+00	\N	f
77	1	103	601.88	BRL	8	2021-08-20	2021-08-19 20:29:47.617276+00	\N	f
78	1	104	541.692	BRL	8	2021-08-20	2021-08-19 20:30:27.489625+00	\N	f
79	1	105	135.423	BRL	8	2021-08-21	2021-08-20 00:35:05.549978+00	2021-08-20	t
80	1	106	242.94	BRL	8	2021-08-21	2021-08-20 01:21:39.101095+00	\N	f
38	1	1	451.40999999999997	BRL	8	2021-08-20	2021-08-19 18:57:25.480605+00	\N	f
46	1	71	150.47	BRL	8	2021-08-20	2021-08-19 19:38:31.762792+00	\N	f
48	1	74	300.94	BRL	8	2021-08-20	2021-08-19 19:40:28.58408+00	\N	f
51	1	77	752.35	BRL	8	2021-08-20	2021-08-19 19:46:20.757218+00	\N	f
\.


--
-- Data for Name: payment_method; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.payment_method (id, name, portion_quantity, deleted_at, daystopay) FROM stdin;
11	test3	3	2021-08-12	\N
3	Cartão Crédito 1X	1	\N	30
4	Cartão Crédito 2X	2	\N	60
5	Cartão Crédito 4X	4	\N	120
6	Cartão Crédito 8X	8	\N	240
7	Cartão Crédito 12X	12	\N	365
1	Boleto	1	\N	3
2	Cartão Débito	1	\N	1
8	Pix	1	\N	1
9	Paypal	1	\N	1
12	testcontroller	7	\N	\N
14	testdnv2	17	\N	\N
31	Pix14	1	\N	\N
32	testdnv87	17	2021-08-20	\N
\.


--
-- Data for Name: products; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products (id, group_id, name, price, description, add_date, deleted_at, image, creation_userid) FROM stdin;
1	1	Acer Inspire	140.47	Notebook muito loko	2021-08-03	\N	\N	\N
13	6	test4	150.47	test_description4	2021-08-11	\N	\N	\N
14	6	test45controller	120.47	test5_descriptioncontroller	2021-08-16	\N	\N	\N
16	6	test47controllerfinal	121.47	test6_descriptioncontroller	2021-08-17	\N	\N	\N
21	6	testfinal7	121.47	teste247 final	2021-08-20	2021-08-20	\N	\N
20	6	test59controllerfinal	121.47	test6_descriptioncontroller	2021-08-20	\N	\N	\N
22	6	testfinal7userid	121.47	teste247 final	2021-08-20	\N	\N	1
\.


--
-- Data for Name: products_group; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.products_group (id, name, creation_timestamp, deleted_at, creation_userid) FROM stdin;
1	Notebooks	2021-08-03 15:52:38.006153+00	\N	\N
6	Notebooks5	2021-08-11 19:11:28.701009+00	2021-08-11	\N
7	Notebookscontroller	2021-08-16 19:37:27.729939+00	\N	\N
11	NotebooksFinal8	2021-08-20 00:28:39.762347+00	2021-08-20	\N
9	ANotebooksfinalsu2	2021-08-17 01:26:58.651949+00	\N	\N
\.


--
-- Data for Name: promotional_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.promotional_codes (id, code, discount, type_discount, deleted_at, creation_userid) FROM stdin;
1	QWOEPAKMQJF47891	10.00	percentage	\N	\N
6	SHASHASHA2	120.00	fix	2021-08-11	\N
9	VWOEPAKMQJF47892	32.00	percentage	\N	\N
11	12OEPAKMQJF47892	70.00	percentage	2021-08-20	\N
7	XWOEPAKMQJF47891	42.00	percentage	\N	\N
\.


--
-- Data for Name: providers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.providers (id, document, name, country, state, product_type, phone, zip_code, creation_timestamp, deleted_at, creation_userid) FROM stdin;
1	00000178-8	Seu José Eletrônicos	Brazil	SC	Notebooks	47123456789	00001-001	2021-08-03 15:52:14.354947+00	\N	\N
4	20000178-8	Pedrinho eletronicos 2.0	Brazil	SP	Notebooks	12345678	0123456-7	2021-08-11 19:27:16.90344+00	\N	\N
6	20000179-8	Pedrinho eletronicos 3.0controllerses	Brazil	SP	Notebooks	12445678	0223456-7	2021-08-16 19:39:41.119639+00	\N	\N
9	30000129-8	JOAOedrinhocontroller final	Brazil	SP	Notebooks	43445678	0223456-7	2021-08-20 00:28:55.73692+00	2021-08-20	\N
7	20000179-1	Pedrinho 6.0	Brazil	SP	Notebooks	13445678	0223456-7	2021-08-17 01:27:20.173283+00	\N	\N
\.


--
-- Data for Name: req_refunds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.req_refunds (id, user_id, reason, sale_header_id, deleted_at) FROM stdin;
1	1	negocio ruim	25	\N
2	1	negocio ruim2	25	\N
3	1	negocio ruim2	28	\N
4	1	negocio ruim blabla	29	\N
5	1	negocio ruim blabla controller	32	2021-08-16
6	1	negocio ruim blabla controller	33	2021-08-18
7	1	negocio ruim blabla controller	105	2021-08-20
\.


--
-- Data for Name: roles; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.roles (id, name, deleted_at) FROM stdin;
1	admin	\N
2	user	\N
\.


--
-- Data for Name: sale_header; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_header (id, user_id, promotional_code_id, total, payment_method_id, creation_timestamp, deadline, deleted_at, refunded) FROM stdin;
64	1	\N	451.41	8	2021-08-19 18:57:25.480605+00	2021-08-20	\N	f
70	1	\N	150.47	8	2021-08-19 19:35:24.139018+00	2021-08-20	\N	f
71	1	\N	150.47	8	2021-08-19 19:38:31.756502+00	2021-08-20	\N	f
74	1	\N	300.94	8	2021-08-19 19:40:28.58408+00	2021-08-20	\N	f
77	1	\N	752.35	8	2021-08-19 19:46:20.757218+00	2021-08-20	\N	f
1	2	\N	150.47	8	2021-08-03 15:52:34.339024+00	2021-08-12	\N	f
2	1	\N	140.47	8	2021-08-08 17:45:51.576667+00	2021-08-12	\N	f
21	1	1	388.27	8	2021-08-14 18:29:53.195952+00	2021-08-15	\N	f
25	1	\N	421.41	8	2021-08-15 18:19:15.85087+00	2021-08-16	\N	f
26	1	\N	150.47	8	2021-08-15 19:51:27.510948+00	2021-08-16	\N	f
27	1	\N	150.47	8	2021-08-15 19:52:34.436141+00	2021-08-16	\N	f
28	1	\N	140.47	8	2021-08-15 20:32:42.675829+00	2021-08-16	\N	t
29	1	\N	280.94	8	2021-08-16 15:50:19.252597+00	2021-08-17	\N	t
30	1	\N	431.41	8	2021-08-16 23:20:25.801414+00	2021-08-17	\N	f
31	1	\N	290.94	8	2021-08-16 23:22:15.168203+00	2021-08-17	\N	f
32	1	1	261.85	8	2021-08-16 23:22:54.383509+00	2021-08-17	\N	t
34	1	\N	150.47	8	2021-08-17 23:30:04.168587+00	2021-08-18	\N	f
33	1	\N	140.47	8	2021-08-17 01:44:47.324297+00	2021-08-18	\N	t
35	1	\N	140.47	8	2021-08-18 16:22:31.468752+00	2021-08-19	\N	f
43	1	\N	300.94	8	2021-08-19 18:13:25.769379+00	2021-08-20	\N	f
44	1	\N	150.20	8	2021-08-19 18:13:50.638644+00	2021-08-20	\N	f
46	1	\N	150.20	8	2021-08-19 18:14:40.088662+00	2021-08-20	\N	f
49	1	\N	601.88	8	2021-08-19 18:19:56.417859+00	2021-08-20	\N	f
50	1	\N	752.35	8	2021-08-19 18:22:36.586214+00	2021-08-20	\N	f
51	1	\N	150.47	8	2021-08-19 18:23:53.579853+00	2021-08-20	\N	f
52	1	\N	1053.29	8	2021-08-19 18:29:14.670802+00	2021-08-20	\N	f
98	1	\N	150.47	8	2021-08-19 20:17:06.440198+00	2021-08-20	\N	f
99	1	\N	300.94	8	2021-08-19 20:18:23.262718+00	2021-08-20	\N	f
101	1	1	541.69	8	2021-08-19 20:27:23.361645+00	2021-08-20	\N	f
102	1	\N	300.94	8	2021-08-19 20:28:30.700727+00	2021-08-20	\N	f
103	1	\N	601.88	8	2021-08-19 20:29:47.617276+00	2021-08-20	\N	f
104	1	1	541.69	8	2021-08-19 20:30:27.489625+00	2021-08-20	\N	f
105	1	1	135.42	8	2021-08-20 00:35:05.549978+00	2021-08-21	\N	t
106	1	\N	242.94	8	2021-08-20 01:21:39.101095+00	2021-08-21	\N	f
\.


--
-- Data for Name: sale_items; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.sale_items (sale_header_id, line, product_id, sold_amount, unitary_value, discount_value, plus_value, total, deleted_at, refunded) FROM stdin;
98	1	13	1	150.47	0.00	0.00	150.47	\N	f
99	2	13	2	150.47	0.00	0.00	300.94	\N	f
101	4	13	4	135.42	10.00	0.00	541.69	\N	f
102	2	13	2	150.47	0.00	0.00	300.94	\N	f
103	4	13	4	150.47	0.00	0.00	601.88	\N	f
104	4	13	4	135.42	10.00	0.00	541.69	\N	f
105	1	13	1	135.42	10.00	0.00	135.42	\N	t
1	1	1	1	140.47	0.00	0.00	150.47	\N	f
2	1	1	1	140.47	0.00	0.00	140.47	\N	f
21	2	1	2	126.42	10.00	0.00	252.85	\N	f
21	1	13	1	135.42	10.00	0.00	135.42	\N	f
25	3	1	3	140.47	0.00	0.00	421.41	\N	f
26	1	13	1	150.47	0.00	0.00	150.47	\N	f
27	1	13	1	150.47	0.00	0.00	150.47	\N	f
106	2	20	2	121.47	0.00	0.00	242.94	\N	f
28	1	1	1	140.47	0.00	0.00	140.47	\N	t
29	2	1	2	140.47	0.00	0.00	280.94	\N	t
30	2	1	2	140.47	0.00	0.00	280.94	\N	f
30	1	13	1	150.47	0.00	0.00	150.47	\N	f
31	1	13	1	150.47	0.00	0.00	150.47	\N	f
31	1	1	1	140.47	0.00	0.00	140.47	\N	f
32	1	1	1	126.42	10.00	0.00	126.42	\N	t
32	1	13	1	135.42	10.00	0.00	135.42	\N	t
34	1	13	1	150.47	0.00	0.00	150.47	\N	f
33	1	1	1	140.47	0.00	0.00	140.47	\N	t
35	1	1	1	140.47	0.00	0.00	140.47	\N	f
43	2	13	2	150.47	0.00	0.00	300.94	\N	f
49	4	13	4	150.47	0.00	0.00	601.88	\N	f
50	5	13	5	150.47	0.00	0.00	752.35	\N	f
51	1	13	1	150.47	0.00	0.00	150.47	\N	f
70	1	13	1	150.47	0.00	0.00	150.47	\N	f
71	1	13	1	150.47	0.00	0.00	150.47	\N	f
74	2	13	2	150.47	0.00	0.00	300.94	\N	f
77	5	13	5	150.47	0.00	0.00	752.35	\N	f
\.


--
-- Data for Name: stock; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.stock (product_id, amount, creation_timestamp, deleted_at, creation_userid, update_userid) FROM stdin;
1	40	2021-08-03 15:53:51.909662+00	\N	\N	1
13	30	2021-08-12 19:26:36.78147+00	\N	\N	1
20	88	2021-08-20 00:58:07.54294+00	\N	1	1
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, role_id, document, email, password, first_name, last_name, address, city, state, zip_code, phone, birth_date, creation_timestamp, deleted_at, reset_code, expire_time) FROM stdin;
23	2	573478513	pedro-s23.novaes@hotmail.com	$2b$10$8hh7vv7kEOPYEopVIPQFc.kmPdtxhPumS.7kqK/1hJCWzAMmtK/Pu	Pedrao3	Sousa2	test72	Guarulhos	SP	133	1177016064	2001-09-27	2021-08-11 19:46:11.782802+00	2021-08-11	\N	\N
2	1	575107449	pedrinho@hotmail.com	123	Pedrinho	Pedrao	test2	Guarulhos	SP	08943-210	11978151606	1995-04-22	2021-08-03 15:52:11.317722+00	\N	\N	\N
21	2	543478513	diego-s23.novaes@hotmail.com	12345	Diegao2	Sousa2	test2	Guarulhos	SP	123	1197016064	2001-09-27	2021-08-10 15:57:36.532548+00	\N	\N	\N
28	2	473478519	pedro-ss.novaes@hotmail.com	$2b$10$wCwOzWrRQMjcqkvUupJuT.9hzmVXtdSd4BVoiLAM7lTF9zo4g11nq	Pedrao3	Sousa2	test72	Guarulhos	SP	133	1187016064	2001-09-27	2021-08-16 19:07:37.059424+00	2021-08-16	\N	\N
7	1	545307477	diego-s2.novaes@hotmail.com	1234	Diego	Sousa	test	Guarulhos	SP	07243-210	119701516067	2001-09-27	2021-08-10 15:40:33.564356+00	\N	b04ce34b77a6eaf3e97f903468e68980bdf11dbd	2021-08-17 03:25:31.247
30	2	973478519	pedroc-controler.novaes@hotmail.com	$2b$10$lZu064/TMX0DTl77spPwl.Xb9TDj3s2fQa8vuvza.kA3hlaWjO2Z2	Pedrao3	Sousa2	test72	Guarulhos	SP	133	1787016064	2001-09-27	2021-08-17 01:24:11.936339+00	2021-08-17	\N	\N
1	1	545307478	diego-s.novaes@hotmail.com	$2b$10$1fgx1SCDjJmOcvKOjNRvtuAsBPJw5ixIC4WBvFrQCfhtgzqO/Pj5y	Diego	Sousa	test	Guarulhos	SP	07243-210	11970151606	2001-09-27	2021-08-03 15:52:08.370274+00	\N	\N	\N
31	2	673478519	pedroc-controlerdb.novaes@hotmail.com	$2b$10$fcGkETsQif7lU8idy236Eug0GH4zf9D7TL92Gb/7OKu2M1W2tUJKa	Pedrao5	Sousa2	test72	Guarulhos	SP	133	1987016064	2001-09-27	2021-08-20 00:08:58.39188+00	2021-08-20	\N	\N
\.


--
-- Name: bills_pay_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_pay_id_seq', 13, true);


--
-- Name: bills_receive_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.bills_receive_id_seq', 80, true);


--
-- Name: payment_method_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.payment_method_id_seq', 33, true);


--
-- Name: products_group_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_group_id_seq', 12, true);


--
-- Name: products_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.products_id_seq', 22, true);


--
-- Name: promotional_codes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.promotional_codes_id_seq', 12, true);


--
-- Name: providers_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.providers_id_seq', 10, true);


--
-- Name: req_refunds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.req_refunds_id_seq', 7, true);


--
-- Name: roles_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.roles_id_seq', 2, true);


--
-- Name: sale_header_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.sale_header_id_seq', 106, true);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 31, true);


--
-- Name: bills_pay bills_pay_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_pay
    ADD CONSTRAINT bills_pay_pk PRIMARY KEY (id);


--
-- Name: bills_receive bills_receive_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_receive
    ADD CONSTRAINT bills_receive_pk PRIMARY KEY (id, user_id, sale_header_id);


--
-- Name: payment_method payment_method_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method
    ADD CONSTRAINT payment_method_id_key UNIQUE (id);


--
-- Name: payment_method payment_method_name_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method
    ADD CONSTRAINT payment_method_name_key UNIQUE (name);


--
-- Name: products_group products_group_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_group
    ADD CONSTRAINT products_group_pk PRIMARY KEY (id);


--
-- Name: products products_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_pk PRIMARY KEY (id);


--
-- Name: promotional_codes promotional_codes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_codes
    ADD CONSTRAINT promotional_codes_code_key UNIQUE (code);


--
-- Name: promotional_codes promotional_codes_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_codes
    ADD CONSTRAINT promotional_codes_pk PRIMARY KEY (id);


--
-- Name: providers providers_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_id_key UNIQUE (id);


--
-- Name: providers providers_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_phone_key UNIQUE (phone);


--
-- Name: providers providers_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_pk PRIMARY KEY (id, document);


--
-- Name: roles roles_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.roles
    ADD CONSTRAINT roles_pk PRIMARY KEY (id);


--
-- Name: sale_header sale_header_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_header
    ADD CONSTRAINT sale_header_id_key UNIQUE (id);


--
-- Name: sale_header sale_header_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_header
    ADD CONSTRAINT sale_header_pk PRIMARY KEY (id, user_id);


--
-- Name: sale_items sale_items_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_pk PRIMARY KEY (sale_header_id, line, product_id);


--
-- Name: stock stock_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_pk PRIMARY KEY (product_id);


--
-- Name: providers unique_document_provider; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT unique_document_provider UNIQUE (document);


--
-- Name: users unique_emai; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT unique_emai UNIQUE (email);


--
-- Name: payment_method unique_method_name; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.payment_method
    ADD CONSTRAINT unique_method_name UNIQUE (name);


--
-- Name: products_group unique_name_pgroup; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_group
    ADD CONSTRAINT unique_name_pgroup UNIQUE (name);


--
-- Name: users users_document_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_document_key UNIQUE (document);


--
-- Name: users users_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_id_key UNIQUE (id);


--
-- Name: users users_phone_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_phone_key UNIQUE (phone);


--
-- Name: users users_pk; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pk PRIMARY KEY (id, role_id, document);


--
-- Name: bills_pay_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bills_pay_currency ON public.bills_pay USING btree (currency, deleted_at);


--
-- Name: bills_pay_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bills_pay_method ON public.bills_pay USING btree (method_id, deleted_at);


--
-- Name: bills_receive_currency; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bills_receive_currency ON public.bills_receive USING btree (currency, deleted_at);


--
-- Name: bills_receive_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX bills_receive_method ON public.bills_receive USING btree (method_id, deleted_at);


--
-- Name: products_group_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_group_name ON public.products_group USING btree (name, deleted_at);


--
-- Name: products_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX products_name ON public.products USING btree (name, deleted_at);


--
-- Name: provider_data; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX provider_data ON public.providers USING btree (document, name, deleted_at);


--
-- Name: provider_local; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX provider_local ON public.providers USING btree (country, state, deleted_at);


--
-- Name: sale_header_method; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sale_header_method ON public.sale_header USING btree (payment_method_id, deleted_at);


--
-- Name: sale_items_line; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX sale_items_line ON public.sale_items USING btree (line, deleted_at);


--
-- Name: stock_quantity; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX stock_quantity ON public.stock USING btree (amount, deleted_at);


--
-- Name: user_document; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_document ON public.users USING btree (document, deleted_at);


--
-- Name: user_email; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_email ON public.users USING btree (email, deleted_at);


--
-- Name: user_local; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_local ON public.users USING btree (city, state, deleted_at);


--
-- Name: user_name; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX user_name ON public.users USING btree (first_name, last_name, deleted_at);


--
-- Name: bills_receive bills_method_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_receive
    ADD CONSTRAINT bills_method_fk0 FOREIGN KEY (method_id) REFERENCES public.payment_method(id);


--
-- Name: bills_pay bills_pay_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_pay
    ADD CONSTRAINT bills_pay_fk0 FOREIGN KEY (provider_id) REFERENCES public.providers(id);


--
-- Name: bills_pay bills_pay_method_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_pay
    ADD CONSTRAINT bills_pay_method_fk0 FOREIGN KEY (method_id) REFERENCES public.payment_method(id);


--
-- Name: bills_pay bills_pay_user_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_pay
    ADD CONSTRAINT bills_pay_user_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bills_receive bills_receive_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_receive
    ADD CONSTRAINT bills_receive_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: bills_receive bills_receive_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.bills_receive
    ADD CONSTRAINT bills_receive_fk1 FOREIGN KEY (sale_header_id) REFERENCES public.sale_header(id);


--
-- Name: sale_header method_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_header
    ADD CONSTRAINT method_fk0 FOREIGN KEY (payment_method_id) REFERENCES public.payment_method(id);


--
-- Name: products products_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_fk0 FOREIGN KEY (group_id) REFERENCES public.products_group(id);


--
-- Name: products products_fkuser; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products
    ADD CONSTRAINT products_fkuser FOREIGN KEY (creation_userid) REFERENCES public.users(id);


--
-- Name: products_group products_group_fkuser; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.products_group
    ADD CONSTRAINT products_group_fkuser FOREIGN KEY (creation_userid) REFERENCES public.users(id);


--
-- Name: promotional_codes promotional_codes_fkuser; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.promotional_codes
    ADD CONSTRAINT promotional_codes_fkuser FOREIGN KEY (creation_userid) REFERENCES public.users(id);


--
-- Name: providers providers_fkuser; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.providers
    ADD CONSTRAINT providers_fkuser FOREIGN KEY (creation_userid) REFERENCES public.users(id);


--
-- Name: req_refunds req_refunds_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.req_refunds
    ADD CONSTRAINT req_refunds_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: req_refunds req_refunds_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.req_refunds
    ADD CONSTRAINT req_refunds_fk1 FOREIGN KEY (sale_header_id) REFERENCES public.sale_header(id);


--
-- Name: sale_header sale_header_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_header
    ADD CONSTRAINT sale_header_fk0 FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: sale_header sale_header_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_header
    ADD CONSTRAINT sale_header_fk1 FOREIGN KEY (promotional_code_id) REFERENCES public.promotional_codes(id);


--
-- Name: sale_items sale_items_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_fk0 FOREIGN KEY (sale_header_id) REFERENCES public.sale_header(id);


--
-- Name: sale_items sale_items_fk1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sale_items
    ADD CONSTRAINT sale_items_fk1 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock stock_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_fk0 FOREIGN KEY (product_id) REFERENCES public.products(id);


--
-- Name: stock stock_fkuser; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_fkuser FOREIGN KEY (creation_userid) REFERENCES public.users(id);


--
-- Name: stock stock_fkuser1; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.stock
    ADD CONSTRAINT stock_fkuser1 FOREIGN KEY (update_userid) REFERENCES public.users(id);


--
-- Name: users users_fk0; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_fk0 FOREIGN KEY (role_id) REFERENCES public.roles(id);


--
-- PostgreSQL database dump complete
--

