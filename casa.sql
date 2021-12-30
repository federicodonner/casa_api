-- phpMyAdmin SQL Dump
-- version 4.9.7
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Dec 30, 2021 at 01:14 AM
-- Server version: 5.7.32
-- PHP Version: 7.4.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `casa`
--

-- --------------------------------------------------------

--
-- Table structure for table `casa`
--

DROP TABLE IF EXISTS `casa`;
CREATE TABLE `casa` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `hash` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `presupuesto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `categoria`
--

DROP TABLE IF EXISTS `categoria`;
CREATE TABLE `categoria` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `casaId` int(11) NOT NULL,
  `presupuesto` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `gasto`
--

DROP TABLE IF EXISTS `gasto`;
CREATE TABLE `gasto` (
  `id` int(11) NOT NULL,
  `fecha` int(12) NOT NULL,
  `nombre` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `descripcion` text CHARACTER SET utf8 COLLATE utf8_bin,
  `categoriaId` int(11) NOT NULL,
  `monto` float NOT NULL,
  `monedaId` int(11) NOT NULL,
  `usuarioId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

DROP TABLE IF EXISTS `login`;
CREATE TABLE `login` (
  `id` int(11) NOT NULL,
  `fecha` int(12) NOT NULL,
  `token` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `usuarioId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `moneda`
--

DROP TABLE IF EXISTS `moneda`;
CREATE TABLE `moneda` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `simbolo` varchar(5) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- Table structure for table `usuario`
--

DROP TABLE IF EXISTS `usuario`;
CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(200) CHARACTER SET utf8 COLLATE utf8_bin NOT NULL,
  `casaId` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `casa`
--
ALTER TABLE `casa`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categoria`
--
ALTER TABLE `categoria`
  ADD PRIMARY KEY (`id`),
  ADD KEY `categoria_x_casa` (`casaId`);

--
-- Indexes for table `gasto`
--
ALTER TABLE `gasto`
  ADD PRIMARY KEY (`id`),
  ADD KEY `gasto_x_categoria` (`categoriaId`),
  ADD KEY `gasto_x_usuario` (`usuarioId`),
  ADD KEY `gasto_x_moneda` (`monedaId`);

--
-- Indexes for table `login`
--
ALTER TABLE `login`
  ADD PRIMARY KEY (`id`),
  ADD KEY `token_x_usuario` (`usuarioId`);

--
-- Indexes for table `moneda`
--
ALTER TABLE `moneda`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_x_casa` (`casaId`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `casa`
--
ALTER TABLE `casa`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `categoria`
--
ALTER TABLE `categoria`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `gasto`
--
ALTER TABLE `gasto`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `login`
--
ALTER TABLE `login`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `moneda`
--
ALTER TABLE `moneda`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `categoria`
--
ALTER TABLE `categoria`
  ADD CONSTRAINT `categoria_x_casa` FOREIGN KEY (`casaId`) REFERENCES `casa` (`id`);

--
-- Constraints for table `gasto`
--
ALTER TABLE `gasto`
  ADD CONSTRAINT `gasto_x_categoria` FOREIGN KEY (`categoriaId`) REFERENCES `categoria` (`id`),
  ADD CONSTRAINT `gasto_x_moneda` FOREIGN KEY (`monedaId`) REFERENCES `moneda` (`id`),
  ADD CONSTRAINT `gasto_x_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`);

--
-- Constraints for table `login`
--
ALTER TABLE `login`
  ADD CONSTRAINT `token_x_usuario` FOREIGN KEY (`usuarioId`) REFERENCES `usuario` (`id`);

--
-- Constraints for table `usuario`
--
ALTER TABLE `usuario`
  ADD CONSTRAINT `usuario_x_casa` FOREIGN KEY (`casaId`) REFERENCES `casa` (`id`);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
